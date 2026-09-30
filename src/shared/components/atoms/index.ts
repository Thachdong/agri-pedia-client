// Atom có tuỳ biến riêng của project.
export { Avatar, type TAvatarProps } from "./avatar";
export { Button, type TButtonProps } from "./button";

// Primitive shadcn dùng nguyên bản — import qua atoms, không import thẳng `ui/`.
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
export { Input } from "../ui/input";
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp";
export { Label } from "../ui/label";
export { RadioGroup, RadioGroupItem } from "../ui/radio-group";
export { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
export { Textarea } from "../ui/textarea";
