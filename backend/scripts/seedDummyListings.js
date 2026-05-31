#!/usr/bin/env node
/**
 * Seed Dummy Listings
 * Inserts 11 book listings from the HTML mockups for demo purposes.
 * Run: node scripts/seedDummyListings.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize, User, Listing, SiteSettings } = require('../src/models');
const bcrypt = require('bcryptjs');

const DUMMY_BOOKS = [
  // From landing page mockup
  {
    title: 'Sidon Efsanesi - Arthur Miller',
    description: 'Arthur Miller\'in klasik eseri Sidon Efsanesi. İkinci el, temiz durumda. Hukuk öğrencileri için harika bir kaynak. Bu kitap, tarihi bir perspektiften hukuki kavramlara yaklaşır.',
    price: 250.00,
    category: 'Edebiyat',
    condition: 'Az Kullanılmış',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCM4ZpmJraEpp3JTKjwTLM8tQrOgB0kzCL5vElbaA8r6Ud5geuF3x1BSVlXMCwY7nyHTR8N4XvKp74o96_lRCeT2Y-JRdPfZ6qGgoJUJEHl75zU87l1Xlrne4sxYHPw3fk9QZIIBma8HNI5f130i5L4A500B5zveMsU29I6YuTGR6OLuCYX1AmsYrUr-4gegPvtfD7uJDIk1YtM_mIMBtRARnepn6N__XLLEayvaZkBMK8M0bP_ciwswY4k7kqr6zg_fCx0X4CiMRY']
  },
  {
    title: 'Bilinmeyen Rota - Agatha Christie',
    description: 'Agatha Christie\'nin heyecan verici polisiye romanı. Sıfır gibi durumda, hiç okunmamış. Kitapseverler için ideal bir seçenek.',
    price: 320.00,
    category: 'Edebiyat',
    condition: 'Sıfır Gibi',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDEPTmjC_jW7g9DFrRb3CzDaSQqT3GJWMonoswHR9-KgabUimpDRc6tGOUA_ctoMEQcAzPX_26V2tZbkgtm9RdEYL-qHg9vnJ1UfJ0tLJVSK5x-4yRYQz5vbfUqMbAXb7iHN9Xc1enz8o5m7jsWeMqv_z1tagd9I1J258j-yQoEPcDjD-p0Ltxgsfu9TrbGnmJ6_2sJWUVilMMU-s3dEDJpV2VDz8LN1VKJukt-Uoa6-Cg1aCtn-sxHX6qobm2u1nhpveoQ1uvV8cI']
  },
  {
    title: 'Çok Satanlar Koleksiyonu - Paulo Coelho',
    description: 'Paulo Coelho\'nun en çok satan eserlerinden oluşan özel koleksiyon. Kişisel gelişim ve felsefi derinlik arayanlar için tavsiye edilir.',
    price: 320.00,
    category: 'Kişisel Gelişim',
    condition: 'Sıfır',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAzYLwP3ogEoUYiL_44If8kXgMcRZGju-lEcOChDhzHhiiS9GSnWGtTsC3loNIVHYa_3MnCVdwSaWa8JlkwC1H4336BRGP6__h938hiYjbZ9TepDodKyWhfeRe0wUTuq6WMzctpqFx1HmipJLjFJnVQ6e6rF1z88cQWSfKq6mnTuNgduRKXrsF4mUXPoDMwNz1hPNnxUhx75ljf4u4lfwM0TzJkfYybGj8qmFI-SIKBj3KGsmMbXASKtdu8Ka3MZZRaYEQKL8gKGqc']
  },
  {
    title: 'Biyoistatistik Ders Kitabı',
    description: 'Hukuk ve tıp alanında kullanılan biyoistatistik ders kitabı. Üniversite düzeyinde, kapsamlı bir kaynak. İstatistik ve hukuk kesişim noktasını inceler.',
    price: 320.00,
    category: 'Hukuk',
    condition: 'Kullanılmış',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBSk-5avKLGa-3ZMNryLF4BWgOo75va7Yi1VQTTFKzxU4MAtLV2GO_X86X9HgiBSodlval4Snulvi-TsY3MLoBmIAbwhOmrAaKH_AWmpsH6KPnlCvF1sD521qMUKzFubQYl4wsjx53jJh8rgrcDsKF5LFnJzqQiGl7qOvWkhRXbQC2LFK04OEdb4BdAtkO_Nc9sNXE7kPukSrBMxs2TmnV0xsO4y6N6nWXXpGJXKP9hldnDLF-PkPiCqjzFn7oyBLElvM3yXFEIty4']
  },
  {
    title: 'Asmalı Bahçe - Elif Şafak',
    description: 'Elif Şafak\'ın ödüllü romanı Asmalı Bahçe. İkinci el ama mükemmel durumda. Edebiyat severlerin kaçırmaması gereken bir eser.',
    price: 320.00,
    category: 'Edebiyat',
    condition: 'Az Kullanılmış',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuANLDfTUsOQxhsGlPU7ti77NIxEp8zM9q-2pw9-hYXv3btwzWb6UGLRwLtzoMuCfr1pkH-TlWhz0Aq_r5Vsnf-t3Xajr0oHjQL28sL2Juq3uVXiBrfdV0Oiyz-EnHRtE7VqYvYXQ-SGu50NDGOz25SeiMBFMvBpF6CcUacICJqVOGur16IWOehvB8BumPhRNmOX-Xk0YwPtbyw7GOcHQ9UvjoUK7iL_jtxvKtxKXs1FHs4ZGA6Qj4X6zHgCyCVPh61YssU81oHaPmg']
  },
  {
    title: 'Sağım Solum Sobe - Orhan Pamuk',
    description: 'Nobel ödüllü yazar Orhan Pamuk\'un başyapıtı. Edebiyat tarihine damga vuran bu eser, Türk edebiyatının en önemli romanlarından biridir.',
    price: 350.00,
    category: 'Edebiyat',
    condition: 'Sıfır Gibi',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBqawUyq4eneyAQ8W9yPv6Q85i-Jv64unsGxHlXtmm6Qu_vFTyxygmekxzv1A5GoQvQDNsU4cxhbZggvhRVGeljCPflZxecYzVCVSlkzKeX3dTJrQnlmYpVqybbhRV-za44UU5pW9L_8iP8Enbz1ThZ2QqIPu7IGJeOcGAcljg-urBLxznjPClLnS0o51KcefSuPWEwTKK1-En_4I9vQxz4c6GDHuzfZw10_ZZ4z28i3mIcLYPbLRECAEDYh61iFtdZQX_ZuFJmEB0']
  },
  // From product detail page mockup
  {
    title: 'Zamanın Kısa Tarihi - Stephen Hawking',
    description: 'Stephen Hawking\'in dünyaca ünlü bilim kitabı. Evrenin doğası ve zamanın yapısı üzerine erişilebilir bir anlatım sunar. Bilim meraklıları için vazgeçilmez.',
    price: 85.00,
    category: 'Bilim',
    condition: 'Az Kullanılmış',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDNROTtEwr-NbYeJfGTk8nR6W1etLXSvJtyAQ7r6hnWeaGelLPOdb2-m2jxMGQ8kFta9emUe3f-xWL5_9GW4ks9rFkR-I557ko8_H55sh_8ySvRDJFCoPjbqfnBP67zB6OZOEQopCGh-yQao3hYq0_juTRyVi6CI1VERrqQ4Od6v7GExFl8vDn2btmGrfc7RIiFpPrSKj2O2PoljlqtHXMU4pKF2fAuJEt1ImY1KWKL4FZQCLBoFsD2WHfNFnGFLhraQaWkwcDN08s']
  },
  {
    title: 'Bilinmeyen Bir Kadının Mektubu - Stefan Zweig',
    description: 'Stefan Zweig\'ın en bilinen novellası. Bir kadının tek taraflı aşkını anlatan bu kısa roman, dünya edebiyatının klasikleri arasında yer alır.',
    price: 42.50,
    category: 'Edebiyat',
    condition: 'Sıfır',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBy1sHCdp5p0Zh4ogBRPzkbRHLqWZrJi0K_NxHPBYksAvuQabTuGjWf855_tt9d7qwYL7qNBUcQhxZh8IL7bpAvTF2uwTUXDZbHzSEwdrAJQDVvt9pG6gzwSosfjzFigNYL_cDqEqx_Pr-eul5GRUjRBjl47Z71kWsKB0msowUodET1PFvetNQ1ejpdmhuOLoPv1hmx2Ss9ULSV5F3-fyFNlOq_5vMoRNeW00rISYKJU65iPIIjOdSE23uvsa3MIgJjyeYVJfM2nk4']
  },
  {
    title: 'Sapiens: Hayvanlardan Tanrılara - Yuval Noah Harari',
    description: 'İnsanlık tarihinin büyük anlatısı. Yuval Noah Harari, homo sapiens\'in yükselişini benzersiz bir perspektifle ele alır. Tarih ve antropoloji meraklıları için.',
    price: 120.00,
    category: 'Tarih',
    condition: 'Az Kullanılmış',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCubUywozZ0ab_AP4dkhmcmxr-XBOgS7dVTNLkDBoCp0E3cucWOToicieCP3PuvuuBCXkedvs4oLbrog8Ex4eEcLQ-p8gZVm3EXKraXjK4lXOTqAvNb5UbkJkuTbrvWKU4ZdHJ9agd5X9M-dtSuRbE8BtP1ROLuKGeVwBzHl3Ck4IXGqONPkOMCO-1b5I6Ghi5b7xEY0xZDTYNMiXAUP9EebEvaX4vSQLFXt9b-71U8On2Q6UnDZg2yI9YJydan0KkAGl9MCKRcd5E']
  },
  {
    title: '1984 - George Orwell',
    description: 'George Orwell\'ın distopik başyapıtı. Totaliter bir rejimi betimleyen bu roman, modern toplum eleştirisi için hâlâ en güçlü eserlerden biridir.',
    price: 55.00,
    category: 'Edebiyat',
    condition: 'Kullanılmış',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBilQeYBQRWnz92fMd9ebb42mxCZo5WtlYFojNpj8GvvC8Kbk5g6xfwG8FIzk6HGKsDLEv41ev4VODElLpV1UmRpLcTXTzDgJ2Tv1oMjm3Zrt1hNRwUwCftiLsiOJA7bAkALZVD6T5ObNpgrXzxRt7k3sGQM9U2RFnLtY35xIPpx2jtONFGIKN2dHxM1fpIGCg4fU6rC2GCnCPJvJWMQvjAooTMdcWO8qVQ5akQqytI509ROrRmWnw86qEcoKm-ZpuPizljZVwt1JM']
  },
  {
    title: 'Simyacı - Paulo Coelho',
    description: 'Paulo Coelho\'nun dünya çapında en çok okunan eseri. Bir çobanın hazine arayışını anlatan bu alegori, kişisel gelişim klasikleri arasında yer alır.',
    price: 68.90,
    category: 'Kişisel Gelişim',
    condition: 'Sıfır Gibi',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC6bzUnR7_X5oXnVO0JkoIfTc0PSYs1ZFY5HTf1BPtz8Jbz0o52VOZnhh9wfELvqV7-nVupPA5Q4Bb4iZbFigcgEaoyBK-d6BMHFiysL9XDOJlQHVtoL-sUYqnXiCBIREXKG1vDDp3a8KzcZq6Ckr-z3BoulM3SJYEbvbirfl5uB_S8g7GwNIBLcheuFA-c4mQKYJHsnusYBP5NP0z9Ae4PzueUAqlG0FaBEkGFm6ZSz9ZeyDIjiPfpNGuYX-RXpunE4gO0sOT6fZg']
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Ensure tables exist
    await sequelize.sync();

    // Create or find demo seller
    const hashedPassword = await bcrypt.hash('Demo1234!', 12);
    const [seller] = await User.findOrCreate({
      where: { email: 'demo@okurpazari.com' },
      defaults: {
        first_name: 'Demo',
        last_name: 'Satıcı',
        password_hash: hashedPassword,
        role: 'USER',
        is_active: true
      }
    });
    console.log(`✅ Demo seller ready (id: ${seller.id})`);

    // Insert listings
    let created = 0;
    for (const book of DUMMY_BOOKS) {
      // Check if listing with same title already exists
      const existing = await Listing.findOne({ where: { title: book.title } });
      if (existing) {
        console.log(`⏭️  Skipping "${book.title}" (already exists)`);
        continue;
      }

      await Listing.create({
        seller_id: seller.id,
        title: book.title,
        description: book.description,
        price: book.price,
        category: book.category,
        condition: book.condition,
        images: book.images,
        status: 'ACTIVE'
      });
      created++;
      console.log(`📚 Created: ${book.title}`);
    }

    // Also seed default categories if not already set
    const existingCats = await SiteSettings.getSetting('categories', null);
    if (!existingCats) {
      const defaultCategories = [
        { name: 'Hukuk', subcategories: ['Ceza Hukuku', 'Medeni Hukuk', 'İdare Hukuku', 'Anayasa Hukuku'] },
        { name: 'Edebiyat', subcategories: ['Roman', 'Şiir', 'Deneme', 'Hikaye'] },
        { name: 'Kişisel Gelişim', subcategories: ['Motivasyon', 'Liderlik', 'İletişim'] },
        { name: 'Tarih', subcategories: ['Dünya Tarihi', 'Türk Tarihi', 'Osmanlı'] },
        { name: 'Bilim', subcategories: ['Fizik', 'Biyoloji', 'Matematik'] },
        { name: 'Çocuk', subcategories: ['Masal', 'Boyama', 'Eğitim'] },
        { name: 'Bilim Kurgu', subcategories: ['Distopya', 'Uzay', 'Fantastik'] },
        { name: 'Ders Kitabı', subcategories: ['Üniversite', 'Lise', 'Sınav Hazırlık'] },
        { name: 'Diğer', subcategories: [] }
      ];
      await SiteSettings.setSetting('categories', defaultCategories, 'Kategori ağacı');
      console.log('✅ Default categories seeded');
    }

    console.log(`\n🎉 Done! Created ${created} new listings.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
