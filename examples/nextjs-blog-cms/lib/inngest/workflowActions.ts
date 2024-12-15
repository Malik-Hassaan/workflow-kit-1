import { type PublicEngineAction } from "@inngest/workflow-kit";

// Actions
//   - Review actions
//     - Add ToC to the article
//     - Add grammar suggestions
//     - [Apply changes]
//     - [Apply changes after approval]
//   - Post-publish actions
//     - Get Tweet verbatim
//     - Get LinkedIn verbatim
export const actions: PublicEngineAction[] = [
  {
    kind: "add_ToC",
    name: "Add a Table of Contents",
    description: "Add an AI-generated ToC",
  },
  {
    kind: "grammar_review",
    name: "Perform a grammar review",
    description: "Use OpenAI for grammar fixes",
  },
  {
    kind: "wait_for_approval",
    name: "Apply changes after approval",
    description: "Request approval for changes",
  },
  // {
  //   kind: "send_to_supabase_email",
  //   name: "Send Email ",
  //   description: "Send Email to a user",
  //   inputs:[

  //         {
  //         title: "Email address",
  //         type:{
  //           title: "Email",
  //           description: "User's email address",
  //           required: true,          
  //         }
  //         fieldType: "text",
          
  //         }
  //   ]
  // }, 
  {
    kind: "apply_changes",
    name: "Apply changes",
    description: "Save the AI revisions",
  },
  {
    kind: "generate_linkedin_posts",
    name: "Generate LinkedIn posts",
    description: "Generate LinkedIn posts",
  },
  {
    kind: "generate_tweet_posts",
    name: "Generate Twitter posts",
    description: "Generate Twitter posts",
  },
  {
    kind: "send_to_supabase_db",
    name: "Send data to database ",
    description: "Send Email to a user",
  },
  // {
  //   kind: "add_product_to_shopify",
  //   name: "Add Product to Shopify",
  //   description: "Send Email to a user",
  // },
  {
    kind: "order_created",
    name: "Order created in shopify ",
    description: "Send Email to a user",
  },


];
