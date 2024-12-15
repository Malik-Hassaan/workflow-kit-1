"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from "react";
import { formFields } from "@/modules/formfields";
import { useRouter } from "next/navigation";
import {createAutomation} from "../../lib/actions/automation.actions"

// Combine validation schemas from formFields
export const combinedSchema = z.object(
  formFields.reduce((schema, field) => {
    if (field.validation) {
      schema[field.id] = field.validation;
    }
    return schema;
  }, {})
);

export const AutomationDetailsForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      name: "",
      trigger: "",
      description: "",
    },
  });

  async function onSubmit(data) {
    try {
      const datauser = {
        name: data.name,
        trigger: data.trigger,
        description: data.description,
      };

      const automationdata = await createAutomation(datauser);

      
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      {/* <style
        dangerouslySetInnerHTML={{
          __html: `
          .PhoneInputInput {
            background-color: #1A1A1A !important;
            color: white !important;
            border-radius: 5px  !important;
            border: 1px solid #374151!important;
            padding: 5px !important;
            position:relative !important
          }
          .PhoneInputCountry{
            color:white !important
            position:absolute !important

          }
          `,
        }}
      ></style> */}


      <form
        onSubmit={handleSubmit(onSubmit)}
        // className="space-y-8 mt-8 bg-primary p-6 rounded-lg shadow-md"
      >

        {formFields.map((field) => {
          switch (field.type) {
            
           
            case "text":
              return (
                <div key={field.id} className="space-y-2 flex flex-col pb-2">
                  <label className="text-gray-600" htmlFor={field.id}>
                    {field.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0  pl-2 flex items-center pointer-events-none">
                     
                    </div>
                    <input
                      className={`p-2  pr-64 rounded-md bg-secondary placeholder:text-gray-400 text-black border border-gray-700`}
                      type={field.type}
                      name={field.id}
                      placeholder={field.placeholder}
                      {...register(field.id)}
                    />
                  </div>
                  {errors[field.id] && (
                    <p className="text-red-500 text-sm">
                      {errors[field.id].message}
                    </p>
                  )}
                </div>
              );
            
            default:
              return (
                <div key={field.id}>
                  {field.label} ({field.type}) is Not Valid Input Type
                </div>
              );
          }
        })}
        <button
          type="submit"
          className="border rounded-full px-4 py-1 mt-4 text-black bg-[#f5f5f5] "
          // className="w-full p-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Submit
        </button>
      </form>

      {/* <pre>{JSON.stringify(watch(), null, 2)}</pre> */}
    </>
  );
};

export default AutomationDetailsForm;
