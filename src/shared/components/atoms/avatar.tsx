import { Avatar as UiAvatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type TUiAvatarProps = React.ComponentProps<typeof UiAvatar>;

export type TAvatarProps = Omit<TUiAvatarProps, "children"> & {
  /** URL ảnh; `null`/rỗng hoặc ảnh lỗi → hiện chữ cái đầu của `name`. */
  src?: string | null;
  /** Tên hiển thị — dùng cho alt + fallback. */
  name: string;
};

const getInitial = (name: string) => name.trim().charAt(0).toLocaleUpperCase("vi-VN") || "?";

export function Avatar({ src, name, className, ...props }: TAvatarProps) {
  return (
    <UiAvatar className={className} {...props}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback className="bg-highlight-subtle font-medium text-highlight" aria-label={name}>
        {getInitial(name)}
      </AvatarFallback>
    </UiAvatar>
  );
}
