import { z } from "zod";

export const Emailschema= z.object({
    email: z.string().email({ message: "Invalid email address" }),
})


export const userschema = Emailschema.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters long" })
});