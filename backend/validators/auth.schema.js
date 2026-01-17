const zod=require("zod");
export const signupSchema=zod.object({
    name : zod.string().min(1),
    email : zod.string().email(),
    password :zod.string().min(4),
    username :zod.string().min(3),
    pin:zod.string().regex(/^\d{6}$/) // ^matlab string yahi se chalu honi chahiye  d matlab digit(0-9) $ matlab yha khatam string

})
export const loginSchema=zod.object({
    email :zod.string().email(),
    password :zod.string().min(4)
})

