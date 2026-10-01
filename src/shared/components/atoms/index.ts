// Atom có tuỳ biến riêng của project.
export { Avatar, type TAvatarProps } from "./avatar";
export { Button, type TButtonProps } from "./button";
export { CountBadge, formatCount, type TCountBadgeProps } from "./count-badge";
export { StarRating, type TStarRatingProps } from "./star-rating";
export { StarRatingInput, type TStarRatingInputProps } from "./star-rating-input";

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
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
export { Input } from "../ui/input";
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp";
export { Label } from "../ui/label";
export { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "../ui/popover";
export { RadioGroup, RadioGroupItem } from "../ui/radio-group";
export { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
export { Textarea } from "../ui/textarea";
export { Toaster } from "../ui/sonner";
