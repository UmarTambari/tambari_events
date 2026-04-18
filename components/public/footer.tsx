import Link from "next/link";
import { Twitter, Instagram, Linkedin, Mail, Ticket } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "About Us", href: "/about" },
      { label: "Become an Organizer", href: "/sign-up" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
    resources: [
      { label: "Help Center", href: "/help" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
    discover: [
      { label: "Browse Events", href: "/events" },
      { label: "Categories", href: "/events?view=categories" },
      { label: "Popular Events", href: "/events?sort=popular" },
      { label: "Free Events", href: "/events?price=free" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/eventhub", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/eventhub", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/eventhub", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Ticket className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">EventHub</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">
              Discover and book tickets to the best events in Nigeria. From concerts to conferences, 
              we&#39;ve got you covered.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Discover</h3>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} EventHub. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:support@eventhub.ng"
                className="hover:text-white transition-colors"
              >
                support@eventhub.ng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}