"use client";
import { Editor, Provider, Sidebar } from "@inngest/workflow-kit/ui";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { type Workflow } from "@/lib/supabase/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { updateWorkflow } from "@/app/actions";
import { actions } from "@/lib/inngest/workflowActions";

import "@inngest/workflow-kit/ui/ui.css";
import "@xyflow/react/dist/style.css";

export const AutomationEditor = ({ workflow }: { workflow: Workflow }) => {
  const router = useRouter();
  const [workflowDraft, updateWorkflowDraft] =
    useState<typeof workflow>(workflow);

  const onSaveWorkflow = useCallback(async () => {
    await updateWorkflow(workflowDraft);
    router.push("/automation");
  }, [router, workflowDraft]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Automation Editor</h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{workflow.name}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </div>
            <Button onClick={onSaveWorkflow}>
              <SaveIcon className="mr-2 h-4 w-4" /> Save changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-svh max-h-[500px]">
            {/* <Provider
              key={workflowDraft?.id}
              workflow={workflowDraft?.workflow}
              trigger={{
                event: {
                  name: workflowDraft.trigger,
                },
              }}
              availableActions={actions}
              onChange={(updated) => {
                updateWorkflowDraft({
                  ...workflowDraft,
                  workflow: updated,
                });
              }}

              
            >
              <Editor>
                <Sidebar position="right" />
              </Editor>
            </Provider> */}

<Provider
  key={workflowDraft?.id}
  workflow={workflowDraft?.workflow}
  trigger={{
    event: {
      name: workflowDraft.trigger,
    },
  }}
  availableActions={actions}
  onChange={async (updatedWorkflow) => {
    updateWorkflowDraft({
      ...workflowDraft,
      workflow: updatedWorkflow,
    });

    
    // const emailAction = updatedWorkflow.actions.find(
    //   (action) => action.kind === "send_to_supabase_email"
    // );

    // if (emailAction) {
  
    //   try {
    //     const response = await fetch('/api/send', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         firstName: "John",
    //         email: "john.doe@example.com", 
    //         subject: "Welcome Email",      
    //       }),
          
    //     });

    //     if (response.ok) {
    //       const result = await response.json();
    //       console.log("Email sent successfully:", result);
    //     } else {
    //       console.error("Failed to send email:", await response.text());
    //     }
    //   } catch (error) {
    //     console.error("Error while sending email:", error);
    //   }
    // }
  }}
>
  <Editor>
    <Sidebar position="right" />
  </Editor>
</Provider>

          </div>
          <CardFooter className="flex justify-end align-bottom gap-4"></CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};
