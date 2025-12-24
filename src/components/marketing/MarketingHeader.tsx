'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-dajaem-green/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🎯</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-dajaem-green to-dajaem-teal bg-clip-text text-transparent group-hover:from-dajaem-green-600 group-hover:to-dajaem-teal-600 transition-all">
              다잼
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm font-medium text-slate-700 hover:text-dajaem-green transition-colors"
            >
              기능
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-700 hover:text-dajaem-green transition-colors"
            >
              가격
            </Link>
            <Link
              href="/apps"
              className="text-sm font-medium text-slate-700 hover:text-dajaem-green transition-colors"
            >
              앱 둘러보기
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" variant="default">
                    무료로 시작하기
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-dajaem-green"
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dajaem-green/10 animate-slide-up">
            <nav className="flex flex-col gap-4">
              <Link
                href="/#features"
                className="text-sm font-medium text-slate-700 hover:text-dajaem-green"
                onClick={() => setMobileMenuOpen(false)}
              >
                기능
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-slate-700 hover:text-dajaem-green"
                onClick={() => setMobileMenuOpen(false)}
              >
                가격
              </Link>
              <Link
                href="/apps"
                className="text-sm font-medium text-slate-700 hover:text-dajaem-green"
                onClick={() => setMobileMenuOpen(false)}
              >
                앱 둘러보기
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <UserMenu />
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        로그인
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="default" className="w-full">
                        무료로 시작하기
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
