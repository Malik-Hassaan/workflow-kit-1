import { Engine } from "@inngest/workflow-kit";

import { loadWorkflow } from "../loaders/workflow";
import { inngest } from "./client";
import { actionsWithHandlers } from "./workflowActionHandlers";

const workflowEngine = new Engine({
  actions: actionsWithHandlers,
  loader: loadWorkflow,
});

export default inngest.createFunction(
  { id: "blog-post-workflow" },
  // Triggers
  // - When a blog post is set to "review"
  // - When a blog post is published
  [
    { event: "blog-post.updated" }, { event: "blog-post.published" },
    { event:"blog-post.new" }, 
   { event:"blog-abc.neww" },
   { event:"orders/create" },


      
  ],
  async ({ event, step }) => {
    // When `run` is called, the loader function is called with access to the event
    await workflowEngine.run({ event, step });
  }
);
