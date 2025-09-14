'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="neu-card-punched rounded-none shadow-lg sticky top-0 z-50 border-b border-gray-300/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">About MyHustle</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <section className="neu-card-punched rounded-3xl p-6 bg-gradient-to-br from-white to-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What is MyHustle?</h2>
          <p className="text-gray-700 leading-relaxed">
            MyHustle is a marketplace for hustlers and merchants. Create a store, add your products or services,
            manage bookings and inventory, and connect with customers in real time. The web app mirrors our Android app
            experience with a fast, mobile-first Neumorphic design.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="neu-pressed rounded-2xl p-4">
              <h3 className="font-medium text-gray-900 mb-1">Sell products and services</h3>
              <p className="text-gray-700 text-sm">Showcase your catalog and let customers order or book instantly.</p>
            </div>
            <div className="neu-pressed rounded-2xl p-4">
              <h3 className="font-medium text-gray-900 mb-1">Manage your business</h3>
              <p className="text-gray-700 text-sm">Track orders, bookings, and messages in one place.</p>
            </div>
          </div>

          <div className="mt-6 neu-pressed rounded-2xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">Need help?</h3>
            <p className="text-gray-700 text-sm">Reach out from your Profile → Messages to contact support.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
