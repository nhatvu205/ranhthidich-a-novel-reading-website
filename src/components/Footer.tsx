import { BookOpen, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-20 bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-secondary" />
            <span className="text-sm text-muted-foreground">
              © 2025 Rảnh Thì Dịch
            </span>
          </div>
          
          {/* Contact Info */}
          <a 
            href="https://www.facebook.com/nhatvu205" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Facebook className="h-4 w-4" />
            <span>Liên hệ Admin</span>
          </a>
          
          <div className="text-sm text-muted-foreground">
            Since 2025
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
