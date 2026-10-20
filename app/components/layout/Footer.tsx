import Link from "next/link";
import BrandLogo from "@/app/components/layout/BrandLogo";
import { siteContainer } from "@/app/components/layout/siteContainer";

const footerColumns = [
  [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Services", href: "/services" },
    { label: "Submit Post", href: "/submit" },
  ],
  [
    { label: "My Posts", href: "/my-posts" },
    { label: "Sign In", href: "/login" },
    { label: "Register", href: "/register" },
  ],
  [
    { label: "Sitemap", href: "/sitemap.xml" },
    { label: "Robots", href: "/robots.txt" },
  ],
];

export default function Footer() {
  return (
    <footer className="border-t-[2.4px] border-gold bg-[#f6f6f6] text-[14px] leading-[21px] text-[#565656]">
      <div className="py-[60px]">
        <div className={siteContainer}>
          <div className="-mx-3 flex flex-wrap">
            <div className="mb-6 w-full px-3 md:mb-0 md:w-1/4">
              <BrandLogo />
              <p className="mt-3 text-[14px] leading-[25.2px] text-[#2a2a2b]">
                Expert SEO insights, guest posting guides, and digital marketing
                strategies to grow your traffic.
              </p>
              <div className="mt-3">
                <strong>
                  <a
                    href="mailto:monietcriss@gmail.com"
                    className="text-[14px] font-bold text-[#34495e] transition-colors hover:text-gold-dark"
                  >
                    monietcriss@gmail.com
                  </a>
                </strong>
              </div>
            </div>

            {footerColumns.map((column, index) => (
              <div key={index} className="mb-4 w-1/2 px-3 md:mb-0 md:w-1/4">
                <ul>
                  {column.map((link) => (
                    <li key={link.href} className="mb-[10px]">
                      <Link
                        href={link.href}
                        className="text-[14px] text-[#565656] transition-colors hover:text-gold-dark"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-ink py-[10px] text-[#d9d2c2]">
        <div className={siteContainer}>
          <p className="mb-0 text-center">
            © {new Date().getFullYear()} RANKINGPOST.com
          </p>
        </div>
      </div>
    </footer>
  );
}
