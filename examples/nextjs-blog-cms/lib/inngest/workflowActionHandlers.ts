import { type EngineAction, type WorkflowAction } from "@inngest/workflow-kit";
import OpenAI from "openai";

import { type BlogPost } from "../supabase/types";

import { loadBlogPost } from "../loaders/blog-post";
import { createClient } from "../supabase/server";
import { actions } from "./workflowActions";
import { inngest } from "./client";
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';


const resend = new Resend(process.env.RESEND_API_KEY);



// helper to ensure that each step of the workflow use
//  the original content or current AI revision
function getAIworkingCopy(workflowAction: WorkflowAction, blogPost: BlogPost) {
  return workflowAction.id === "1" // the first action of the workflow gets assigned id: "1"
    ? blogPost.markdown // if we are the first action, we use the initial content
    : blogPost.markdown_ai_revision || blogPost.markdown; // otherwise we use the previous current ai revision
}

// helper to ensure that each step of the workflow use
//  the original content or current AI revision
function addAiPublishingSuggestion(
  workflowAction: WorkflowAction,
  blogPost: BlogPost,
  additionalSuggestion: string
) {
  return workflowAction.id === "1" // the first action of the workflow gets assigned id: "1"
    ? additionalSuggestion // if we are the first action, we reset the suggestions
    : blogPost.ai_publishing_recommendations + `<br/ >` + additionalSuggestion; // otherwise add one
}

export const actionsWithHandlers: EngineAction<typeof inngest>[] = [
  {
    // Add a Table of Contents
    ...actions[0],
    handler: async ({ event, step, workflowAction }) => {
      const supabase = createClient();

      const blogPost = await step.run("load-blog-post", async () =>
        loadBlogPost(event.data.id)
      );

      const aiRevision = await step.run("add-toc-to-article", async () => {
        const openai = new OpenAI({
          apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
        });

        const prompt = `
        Please update the below markdown article by adding a Table of Content under the h1 title. Return only the complete updated article in markdown without the wrapping "\`\`\`".

        Here is the text wrapped with "\`\`\`":
        \`\`\`
        ${getAIworkingCopy(workflowAction, blogPost)}
        \`\`\`
        `;

        const response = await openai.chat.completions.create({
          model: process.env["OPENAI_MODEL"] || "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI that make text editing changes.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        return response.choices[0]?.message?.content || "";
      });

      await step.run("save-ai-revision", async () => {
        await supabase
          .from("blog_posts")
          .update({
            markdown_ai_revision: aiRevision,
            status: "under review",
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    // Perform a grammar review
    ...actions[1],
    handler: async ({ event, step, workflowAction }) => {
      const supabase = createClient();

      const blogPost = await step.run("load-blog-post", async () =>
        loadBlogPost(event.data.id)
      );

      const aiRevision = await step.run("get-ai-grammar-fixes", async () => {
        const openai = new OpenAI({
          apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
        });

        const prompt = `
        You are my "Hemmingway editor" AI. Please update the below article with some grammar fixes. Return only the complete updated article in markdown without the wrapping "\`\`\`".

        Here is the text wrapped with "\`\`\`":
        \`\`\`
        ${getAIworkingCopy(workflowAction, blogPost)}
        \`\`\`
        `;

        const response = await openai.chat.completions.create({
          model: process.env["OPENAI_MODEL"] || "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI that make text editing changes.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        return response.choices[0]?.message?.content || "";
      });

      await step.run("save-ai-revision", async () => {
        await supabase
          .from("blog_posts")
          .update({
            markdown_ai_revision: aiRevision,
            status: "under review",
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    // Apply changes after approval
    ...actions[2],
    handler: async ({ event, step }) => {
      const supabase = createClient();

      const blogPost = await step.run("load-blog-post", async () =>
        loadBlogPost(event.data.id)
      );

      await step.run("update-blog-post-status", async () => {
        await supabase
          .from("blog_posts")
          .update({
            status: "needs approval",
          })
          .eq("id", event.data.id)
          .select("*");
      });

      // wait for the user to approve or discard the AI suggestions
      const approval = await step.waitForEvent(
        "wait-for-ai-suggestion-approval",
        {
          event: "blog-post.approve-ai-suggestions",
          timeout: "1d",
          match: "data.id",
        }
      );

      // without action from the user within 1 day, the AI suggestions are discarded
      if (!approval) {
        await step.run("discard-ai-revision", async () => {
          await supabase
            .from("blog_posts")
            .update({
              markdown_ai_revision: null,
              status: "draft",
            })
            .eq("id", event.data.id)
            .select("*");
        });
      } else {
        await step.run("apply-ai-revision", async () => {
          await supabase
            .from("blog_posts")
            .update({
              markdown: blogPost.markdown_ai_revision,
              markdown_ai_revision: null,
              status: "published",
            })
            .eq("id", blogPost.id)
            .select("*");
        });
      }
    },
  },
  {
    // Send Emails
    ...actions[3],
    handler: async ({ event, step }) => {
      const stepstart = await step.run("email-event-start", async () =>{
        console.log(`Test Email Event `,event)
        return {newdata:event.data};
      } );

  
      // throw new Error(`Test Email Event Failed`);
      return {newdata:event.data}; 
      // // console.log("Recieved Blog Post New event ",{ event, step})
      // const supabase = createClient();

      // const blogPost = await step.run("load-blog-post", async () =>
      //   loadBlogPost(event.data.id)
      // );

      // await step.run("apply-ai-revision", async () => {
      //   await supabase
      //     .from("blog_posts")
      //     .update({
      //       markdown: blogPost.markdown_ai_revision,
      //       markdown_ai_revision: null,
      //       status: "published",
      //     })
      //     .eq("id", blogPost.id)
      //     .select("*");
      // });
    },
  },
  {
    // Generate LinkedIn posts
    ...actions[4],
    handler: async ({ event, step, workflowAction }) => {
      const supabase = createClient();

      const blogPost = await step.run("load-blog-post", async () =>
        loadBlogPost(event.data.id)
      );

      const aiRecommendations = await step.run(
        "generate-linked-posts",
        async () => {
          const openai = new OpenAI({
            apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
          });

          const prompt = `
          Generate a LinkedIn post that will drive traffic to the below blog post.
          Keep the a profesionnal tone, do not use emojis.

          Here is the blog post text wrapped with "\`\`\`":
          \`\`\`
          ${getAIworkingCopy(workflowAction, blogPost)}
          \`\`\`
          `;

          const response = await openai.chat.completions.create({
            model: process.env["OPENAI_MODEL"] || "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are an Developer Marketing expert.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          return response.choices[0]?.message?.content || "";
        }
      );

      await step.run("save-ai-recommendations", async () => {
        await supabase
          .from("blog_posts")
          .update({
            ai_publishing_recommendations: addAiPublishingSuggestion(
              workflowAction,
              blogPost,
              `\n## LinkedIn posts: \n <br/ >${aiRecommendations}<br/ >`
            ),
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    // Generate Twitter posts
    ...actions[5],
    handler: async ({ event, step, workflowAction }) => {
      const supabase = createClient();
      const numberOfTweets = 2;

      const blogPost = await step.run("load-blog-post", async () =>
        loadBlogPost(event.data.id)
      );

      const aiRecommendations = await step.run("generate-tweets", async () => {
        const openai = new OpenAI({
          apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
        });

        const prompt = `
        Generate ${numberOfTweets} tweets to announce the blog post.
        Keep the tone friendly, feel free to use emojis, and, if relevant, use bullet points teasing the main takeaways of the blog post.
        Prefix each tweet with "----- Tweet number {tweet number} ----- <br/>"

        Here is the blog post text wrapped with "\`\`\`":
        \`\`\`
        ${blogPost.markdown}
        \`\`\`
        `;

        const response = await openai.chat.completions.create({
          model: process.env["OPENAI_MODEL"] || "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an Developer Marketing expert.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        return response.choices[0]?.message?.content || "";
      });

      await step.run("save-ai-recommendations", async () => {
        await supabase
          .from("blog_posts")
          .update({
            ai_publishing_recommendations: addAiPublishingSuggestion(
              workflowAction,
              blogPost,
              `\n## Twitter posts: \n <br/ >${aiRecommendations}<br/ >`
            ),
          })
          .eq("id", event.data.id)
          .select("*");
      });
    },
  },
  {
    ...actions[6],
    handler: async ({ event, step }) => {
      try {

        let eventData = event;
        console.log(` send_to_supabase_db recieved`,eventData)


        const { data, error } = await resend.emails.send({
          from: 'Acme <onboarding@resend.dev>',
          to: "muhammadhassni2006@gmail.com",
          subject: 'Default Subject',
          react: EmailTemplate({ firstName: eventData.firstname, email: eventData.email }),
        });
        return data;

      } catch (error) {
        console.error("Error in handler:", error);
      }
    },
  },
  // {
  //   ...actions[8],
  //   handler: async ({ event, step }) => {
  //     try {
  //       console.log("Handler Invoked for add_product_to_shopify");
    
  //       const productUrl = event.data.productUrl;
  //       if (!productUrl) {
  //         throw new Error("Product URL is missing in event data.");
  //       }
    
  //       console.log("Fetching product data from URL:", productUrl);
    
  //       const productData = await step.run("fetch-product-data", async () => {
  //         const response = await fetch(productUrl, {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             "X-Shopify-Access-Token": "shptka_6c02c733bc4ad1808ae62b2913b5a1a2", 
  //           },
  //         });
    
  //         console.log("Fetch Response Status:", response.status);
  //         console.log("Fetch Response Text:", await response.text());
    
  //         if (!response.ok) {
  //           throw new Error(`Failed to fetch product data: ${response.statusText}`);
  //         }
    
  //         return response.json();
  //       });
    
  //       console.log("Fetched Product Data:", productData);
    
  //       const { title, body_html, ...rest } = productData;
  //       const jsondata = JSON.stringify(rest);
    
  //       console.log("Prepared Data for Supabase:", { title, body_html, status: "added", jsondata });
    
  //       const supabase = createClient();
  //       const { data: productdata, error } = await supabase
  //         .from("shopify-product-data")
  //         .insert({
  //           title,
  //           body_html,
  //           status: "added",
  //           jsondata,
  //         })
  //         .select("*")
  //         .single();
    
  //       if (error) {
  //         console.error("Supabase Insert Error:", error.message);
  //         console.error("Supabase Full Error:", error);
  //       } else {
  //         console.log("Data Successfully Inserted Into Supabase:", productdata);
  //       }
  //     } catch (error) {
  //       console.error("Error in add_product_to_shopify handler:", error);
  //     }
  //   },
    
  // },
  {
    ...actions[7],
    handler: async ({ event, step }) => {
      try {
        console.log("Handler Invoked for add_order_to_database", event);
  
        const supabase = createClient();
  
        const orderData = await step.run("insert-order-to-database", async () => {
          const { data, error } = await supabase
            .from("shopify-order-data")
            .insert({
              admin_graphql_api_id: event.data.admin_graphql_api_id,
              title: event.data.title,
              sku: event.data.sku,
              amount: event.data.amount
            })
            .select("*")
            .single();
  
          if (error) {
            console.error("Supabase Insert Error:", error.message);
            throw new Error(error.message); 
          }
  
          return data;
        });
  
        console.log("Data Successfully Inserted Into Supabase:", orderData);
  
      } catch (error) {
        console.error("Error in add_product_to_database handler:", error);
  
        await step.run("handle-insert-failure", async () => {
          console.error("Handling failure for event:", event);
          
        });
      }
    }
  }
  

  




];
