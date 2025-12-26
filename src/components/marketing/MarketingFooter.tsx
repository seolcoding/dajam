import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-dajaem-green/10 bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <h2 className="text-xl font-bold bg-gradient-to-r from-dajaem-green to-dajaem-teal bg-clip-text text-transparent">
                다잼
              </h2>
            </Link>
            <p className="text-sm text-slate-600 mb-4">
              다같이 재미있게! 우리들의 인터랙션 공간
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/dajaem"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full bg-dajaem-green-50 hover:bg-dajaem-green-100 flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4 text-dajaem-teal" />
              </a>
              <a
                href="https://twitter.com/dajaem_app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-dajaem-green-50 hover:bg-dajaem-green-100 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4 text-dajaem-teal" />
              </a>
              <a
                href="https://linkedin.com/company/dajaem"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-dajaem-green-50 hover:bg-dajaem-green-100 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4 text-dajaem-teal" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">제품</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/#features" className="hover:text-slate-900">
                  기능
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-900">
                  가격
                </Link>
              </li>
              <li>
                <Link href="/apps" className="hover:text-slate-900">
                  앱 둘러보기
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">지원</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a
                  href="mailto:ssalssi1@gmail.com"
                  className="hover:text-slate-900"
                >
                  문의하기
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/seolcoding/dajam/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900"
                >
                  버그 리포트
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">법률</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/terms" className="hover:text-slate-900">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dajaem-green/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div>&copy; 2024 다잼(Dajam). All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a
                href="https://dajaem.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-dajaem-green"
              >
                dajaem.app
              </a>
              <a
                href="https://github.com/dajaem"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-dajaem-green"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
