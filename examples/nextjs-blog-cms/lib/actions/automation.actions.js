"use server"

import { createClient } from "@/utils/supabase/server";




export const createAutomation = async (automationdata) => {
    try {
      const supabase = createClient();
      console.log({ automationdata });
     
      let { data: newUser, error } = await supabase
        .from("workflows")
        .insert({
          name: automationdata.name,
          description: automationdata.description,
          trigger: automationdata.trigger,
         
        })    
        .select("*")
        .single();
  
      console.log({ newUser,error });
      if (error) throw error;
      return newUser;
    } catch (error) {
      console.error("An error occurred while creating a new user1:", error);
    }
  };


