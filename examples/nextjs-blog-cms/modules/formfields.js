
import { z } from "zod"
export const formFields = [

  {
    id: "name",
    name: "name",
    type: "text",
    label: "Full name",
    placeholder: "John Doe",
    required: true,
    icon:"/assets/icons/user.svg",
    validation: z
        .string()
        .min(2, "First Name should be atleast 2 characters long")
        .max(50, "First Name should be atmost 50 characters long"),
       
  },
  {
    id: "trigger",
    name: "trigger",
    type: "text",
    label: "Add Trigger",
    placeholder: "blog-post.new",
    required: true,
    icon:"/assets/icons/user.svg",
    validation: z
        .string()
        .min(2, "First Name should be atleast 2 characters long")
        .max(50, "First Name should be atmost 50 characters long"),
       
  },
  {
    id: "description",
    name: "description",
    type: "text",
    label: "Add Description",
    placeholder: "description",
    required: true,
    icon:"/assets/icons/user.svg",
    validation: z
        .string()
        .min(2, "First Name should be atleast 2 characters long")
        .max(50, "First Name should be atmost 50 characters long"),
       
  },
 
];
