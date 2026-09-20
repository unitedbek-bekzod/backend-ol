import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SequelizeModule, getModelToken } from '@nestjs/sequelize';
import * as argon2 from 'argon2';
import { ALL_MODELS } from './models/index.js';
import { Admin } from './models/admin.model.js';
import { Template, type TemplatePlaceholder } from './models/template.model.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        uri: config.get<string>('DATABASE_URL'),
        models: ALL_MODELS,
        autoLoadModels: true,
        synchronize: true,
        logging: false,
      }),
    }),
    SequelizeModule.forFeature([Template, Admin]),
  ],
})
class SeedModule {}

const COMMON_BLOCKS: TemplatePlaceholder[] = [
  { key: 'hero_title', type: 'text', max_length: 60 },
  { key: 'hero_subtitle', type: 'text', max_length: 120 },
  { key: 'about_text', type: 'text', max_length: 400 },
  { key: 'feature_1_title', type: 'text', max_length: 40 },
  { key: 'feature_1_desc', type: 'text', max_length: 100 },
  { key: 'feature_2_title', type: 'text', max_length: 40 },
  { key: 'feature_2_desc', type: 'text', max_length: 100 },
  { key: 'cta_text', type: 'text', max_length: 30 },
  { key: 'accent_color', type: 'color' },
];

const TEMPLATES: Array<Partial<Template>> = [
  {
    title: 'Yashil Don — Qahva Ustaxonasi',
    category: 'Store',
    templateKey: 'coffee',
    price: '0',
    previewUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    aiCompatible: true,
    blocks: [
      ...COMMON_BLOCKS,
      { key: 'roast_note', type: 'text', max_length: 120 },
      { key: 'origin_note', type: 'text', max_length: 120 },
    ],
  },
  {
    title: 'Tekshir — Sayt va API Monitoringi',
    category: 'Landing Page',
    templateKey: 'landing',
    price: '0',
    previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    aiCompatible: true,
    blocks: [
      ...COMMON_BLOCKS,
      { key: 'pricing_note', type: 'text', max_length: 60 },
      { key: 'features_note', type: 'text', max_length: 120 },
    ],
  },
  {
    title: "Aziz va Malika — To'y Taklifnomasi",
    category: 'Portfolio',
    templateKey: 'portfolio',
    price: '0',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    aiCompatible: true,
    blocks: [
      ...COMMON_BLOCKS,
      { key: 'wedding_date', type: 'text', max_length: 60 },
      { key: 'venue_address', type: 'text', max_length: 150 },
    ],
  },
  {
    title: "Bit Makon — Dasturlash O'quv Markazi",
    category: 'Course',
    templateKey: 'course',
    price: '0',
    previewUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    aiCompatible: true,
    blocks: [
      ...COMMON_BLOCKS,
      { key: 'curriculum_summary', type: 'text', max_length: 200 },
      { key: 'tracks_note', type: 'text', max_length: 100 },
    ],
  },
];

const ADMIN_PHONE = '+998900000000';
const ADMIN_PASSWORD = 'ChangeMe123!';

async function seed() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  const templateModel = app.get<typeof Template>(getModelToken(Template));
  const adminModel = app.get<typeof Admin>(getModelToken(Admin));

  for (const template of TEMPLATES) {
    let existing = await templateModel.findOne({ where: { templateKey: template.templateKey! } });
    if (!existing) {
      existing = await templateModel.findOne({ where: { title: template.title! } });
    }
    if (existing) {
      await existing.update(template);
    } else {
      await templateModel.create(template as any);
    }
  }

  const oldStore = await templateModel.findOne({ where: { title: 'Digital Store' } });
  if (oldStore) {
    try {
      await oldStore.destroy();
    } catch {
      await oldStore.update({ status: 'rejected' });
    }
  }

  const [admin, created] = await adminModel.findOrCreate({
    where: { phone: ADMIN_PHONE },
    defaults: {
      phone: ADMIN_PHONE,
      passwordHash: await argon2.hash(ADMIN_PASSWORD),
      name: 'OL Admin',
    } as any,
  });

  console.log(`Seeded ${TEMPLATES.length} templates.`);
  console.log(
    created
      ? `Created demo admin: phone=${admin.phone} password=${ADMIN_PASSWORD}`
      : `Demo admin already exists: phone=${admin.phone}`,
  );

  await app.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
