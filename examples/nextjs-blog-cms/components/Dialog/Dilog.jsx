import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  
  import {AutomationDetailsForm} from "../Forms/AutomationDetailsForm"

const Dilog = () => {
  return (
<>

<Dialog >
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent className="bg-white  text-black">
    <DialogHeader>
      <DialogTitle className='text-black pb-2 text-center'>Add Data</DialogTitle>
      <DialogDescription>
       <AutomationDetailsForm/>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>




</>
  )
}

export default Dilog