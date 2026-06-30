'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { tm } from '../components/tm';

const productItems = [
  { href: '/products/amerakey', label: 'AmeraKey' },
];

const companyItems = [
  { href: '/company', label: 'Company Overview' },
  { href: '/company/vision-and-mission', label: 'Vision and Mission' },
  { href: '/company/executive-team', label: 'Executive Team' },
  { href: '/company/board-of-advisors', label: 'Board of Advisors' },
  { href: '/company/patents', label: 'Patents' },
];

export default function Header() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);

  const isHome = pathname === '/';
  const isProducts = pathname.startsWith('/products');
  const isIndustries = pathname.startsWith('/industries');
  const isResources = pathname.startsWith('/resources');
  const isNews = pathname.startsWith('/news');
  const isCompany = pathname.startsWith('/company');

  const activeLink = 'text-primary border-b-2 border-primary text-[0.8505rem] font-medium pb-0.5';
  const inactiveLink = 'text-gray-600 hover:text-primary transition-colors duration-200 text-[0.8505rem] font-medium';
  const triggerBase = 'text-[0.8505rem] font-medium inline-flex items-center gap-1 cursor-default select-none';

  const chevron = (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-0.5" onClick={() => setOpen(false)}>
              <Image src="/assets/amera-logo-black.png" alt="Amera" width={135} height={45} className="h-[45px] w-[135px] shrink-0" priority />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={isHome ? activeLink : inactiveLink}>
                Home
              </Link>
              <div className="relative group">
                <span className={`${triggerBase} ${isProducts ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600 transition-colors duration-200'}`}>
                  Products
                  {chevron}
                </span>
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-[#A9A6A7] py-2 min-w-[190px]">
                    {productItems.map((item) => (
                      <Link key={item.href} href={item.href} className="block px-4 py-2 text-[0.8505rem] text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                        {tm(item.label, { markClassName: 'text-[0.86em] font-normal' })}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/industries" className={isIndustries ? activeLink : inactiveLink}>
                Industry Use Cases
              </Link>
              <Link href="/resources" className={isResources ? activeLink : inactiveLink}>White Papers</Link>
              <Link href="/news" className={isNews ? activeLink : inactiveLink}>
                News
              </Link>
              <div className="relative group">
                <span className={`${triggerBase} ${isCompany ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600 transition-colors duration-200'}`}>
                  Company
                  {chevron}
                </span>
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-[#A9A6A7] py-2 min-w-[190px]">
                    {companyItems.map((item) => (
                      <Link key={item.href} href={item.href} className="block px-4 py-2 text-[0.8505rem] text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center gap-2 bg-[#114D8F] hover:bg-[#0E3F75] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-200">
            Contact Us
          </Link>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            {open ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col">
            <Link href="/" onClick={() => setOpen(false)} className={`py-2 text-base font-medium ${isHome ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Home
            </Link>

            <p className="pt-3 pb-1 text-xs font-bold uppercase tracking-[0.08em] text-gray-400">Products</p>
            {productItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="py-2 pl-3 text-base text-gray-700 hover:text-primary">
                {tm(item.label)}
              </Link>
            ))}

            <Link href="/industries" onClick={() => setOpen(false)} className={`py-2 mt-1 text-base font-medium ${isIndustries ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Industry Use Cases
            </Link>
            <Link href="/resources" onClick={() => setOpen(false)} className={`py-2 text-base font-medium ${isResources ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>White Papers</Link>
            <Link href="/news" onClick={() => setOpen(false)} className={`py-2 text-base font-medium ${isNews ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              News
            </Link>

            <p className="pt-3 pb-1 text-xs font-bold uppercase tracking-[0.08em] text-gray-400">Company</p>
            {companyItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="py-2 pl-3 text-base text-gray-700 hover:text-primary">
                {item.label}
              </Link>
            ))}

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 bg-[#114D8F] hover:bg-[#0E3F75] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
