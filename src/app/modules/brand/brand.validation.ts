import { z } from "zod";

const brandSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"), 
  address: z.string().min(1, "Address is required"), 
  description: z.string().min(1, "Description is required") 
});

export const brandValidationSchema = {
    brandSchema
}
