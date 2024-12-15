// import { EmailTemplate } from '../../../components/email-template';
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST(request: Request) {
//   try {
//     const { firstName, email } = await request.json(); // Get data from the request body

//     const { data, error } = await resend.emails.send({
//       from: 'Acme <onboarding@resend.dev>',
//       to: [email || 'default@resend.dev'], // Use dynamic email or default
//       subject: 'Hello world',
//       react: EmailTemplate({ firstName }),
//     });

//     if (error) {
//       return new Response(JSON.stringify({ error }), { status: 500 });
//     }

//     console.log("Email sent data:", data);
//     return new Response(JSON.stringify(data));
//   } catch (error) {
//     console.error("Error in email API:", error);
//     return new Response(JSON.stringify({ error }), { status: 500 });
//   }
// }








"use server"

import { createClient } from "@/utils/supabase/server";


import { EmailTemplate } from '../../../components/email-template';
import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY);



export async function POST(request: Request) {

  try {
    const { firstName, email, subject } = await request.json();


    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: "muhammadhassni2006@gmail.com",
      subject: subject || 'Default Subject',
      react: EmailTemplate({ firstName }),
    });


    console.log("Email sent data:", data);
    if (error) {
      console.error("Error sending email:", error);
      await saveEmailToSupabase(firstName, email, subject, "failed"); 
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    console.log("Email sent successfully:", data);

    
    await saveEmailToSupabase(firstName, email, subject, "sent");

    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error("Error in email API:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
}












export const saveEmailToSupabase = async (firstName: string,
    email: string,
    subject: string,
    status: string) => {
    try {
      const supabase = createClient();
    
     
      let { data: newUser, error } = await supabase
        .from("emails")
        .insert({
            first_name: firstName,
            email: email,
            subject: subject,
            status: status,
         
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
