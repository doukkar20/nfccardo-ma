import {NextRequest,NextResponse} from "next/server";
export function middleware(request:NextRequest){if(request.nextUrl.pathname.startsWith("/admin/dashboard")&&request.cookies.get("nfccardo_admin")?.value!=="demo-authenticated")return NextResponse.redirect(new URL("/admin/login",request.url));return NextResponse.next()}
export const config={matcher:["/admin/dashboard/:path*"]};
