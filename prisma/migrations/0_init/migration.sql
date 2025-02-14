-- CreateEnum
CREATE TYPE "role" AS ENUM ('revisor', 'user', 'admin');

-- CreateTable
CREATE TABLE "Sessions" (
    "sid" VARCHAR(255) NOT NULL,
    "sess" JSONB NOT NULL,
    "expires" TIMESTAMP(6),

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "level" INTEGER,
    "order" INTEGER,
    "status" INTEGER,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),
    "longname" VARCHAR(255),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adressen" (
    "id" SERIAL NOT NULL,
    "mnr" INTEGER,
    "geschlecht" INTEGER NOT NULL DEFAULT 1,
    "name" VARCHAR(255) NOT NULL,
    "vorname" VARCHAR(255) NOT NULL,
    "adresse" VARCHAR(255) NOT NULL,
    "plz" INTEGER NOT NULL,
    "ort" VARCHAR(255) NOT NULL,
    "land" VARCHAR(45) NOT NULL DEFAULT 'CH',
    "telefon_p" VARCHAR(50),
    "telefon_g" VARCHAR(50),
    "mobile" VARCHAR(50),
    "email" VARCHAR(150),
    "eintritt" DATE,
    "sam_mitglied" BOOLEAN NOT NULL DEFAULT false,
    "jahresbeitrag" DECIMAL,
    "mnr_sam" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "vorstand" BOOLEAN NOT NULL DEFAULT false,
    "ehrenmitglied" BOOLEAN NOT NULL DEFAULT false,
    "veteran1" BOOLEAN NOT NULL DEFAULT false,
    "veteran2" BOOLEAN NOT NULL DEFAULT false,
    "revisor" BOOLEAN NOT NULL DEFAULT false,
    "motojournal" BOOLEAN NOT NULL DEFAULT false,
    "austritt" DATE DEFAULT '3000-01-01'::date,
    "austritt_mail" BOOLEAN NOT NULL DEFAULT false,
    "adressenid" INTEGER,
    "jahrgang" INTEGER,
    "arbeitgeber" VARCHAR(50),
    "pensioniert" BOOLEAN NOT NULL DEFAULT false,
    "allianz" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "fullname" VARCHAR(250),

    CONSTRAINT "adressen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anlaesse" (
    "id" SERIAL NOT NULL,
    "datum" DATE NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "beschreibung" VARCHAR(100),
    "punkte" SMALLINT,
    "istkegeln" BOOLEAN NOT NULL DEFAULT false,
    "istsamanlass" BOOLEAN NOT NULL DEFAULT false,
    "nachkegeln" BOOLEAN NOT NULL DEFAULT false,
    "gaeste" SMALLINT DEFAULT 0,
    "anlaesseid" INTEGER,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "longname" VARCHAR(250) NOT NULL,

    CONSTRAINT "anlaesse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget" (
    "id" SERIAL NOT NULL,
    "account" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "memo" VARCHAR(255),
    "amount" DECIMAL,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubmeister" (
    "id" SERIAL NOT NULL,
    "jahr" VARCHAR(4) NOT NULL,
    "rang" SMALLINT,
    "vorname" VARCHAR(255),
    "nachname" VARCHAR(255),
    "mitgliedid" SMALLINT NOT NULL,
    "punkte" SMALLINT,
    "anlaesse" SMALLINT,
    "werbungen" SMALLINT,
    "mitglieddauer" SMALLINT,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clubmeister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscalyear" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "state" INTEGER,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),
    "year" INTEGER,

    CONSTRAINT "fiscalyear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal" (
    "id" SERIAL NOT NULL,
    "from_account" INTEGER,
    "to_account" INTEGER,
    "date" DATE,
    "memo" VARCHAR(255),
    "journalno" INTEGER,
    "amount" DECIMAL DEFAULT 0,
    "status" INTEGER,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),
    "year" INTEGER,

    CONSTRAINT "journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_receipt" (
    "journalid" INTEGER NOT NULL,
    "receiptid" INTEGER NOT NULL,

    CONSTRAINT "journal_receipt_pkey" PRIMARY KEY ("journalid","receiptid")
);

-- CreateTable
CREATE TABLE "kegelkasse" (
    "id" SERIAL NOT NULL,
    "datum" DATE NOT NULL,
    "kasse" DECIMAL NOT NULL,
    "rappen5" INTEGER NOT NULL,
    "rappen10" INTEGER NOT NULL,
    "rappen20" INTEGER NOT NULL,
    "rappen50" INTEGER NOT NULL,
    "franken1" INTEGER NOT NULL,
    "franken2" INTEGER NOT NULL,
    "franken5" INTEGER NOT NULL,
    "franken10" INTEGER NOT NULL,
    "franken20" INTEGER NOT NULL,
    "franken50" INTEGER NOT NULL,
    "franken100" INTEGER NOT NULL,
    "total" DECIMAL NOT NULL,
    "differenz" DECIMAL NOT NULL,
    "journalid" INTEGER,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),
    "userid" INTEGER,

    CONSTRAINT "kegelkasse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegelmeister" (
    "id" SERIAL NOT NULL,
    "jahr" VARCHAR(4) NOT NULL,
    "rang" SMALLINT,
    "vorname" VARCHAR(255),
    "nachname" VARCHAR(255),
    "mitgliedid" SMALLINT NOT NULL,
    "punkte" SMALLINT,
    "anlaesse" SMALLINT,
    "babeli" SMALLINT,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "kegelmeister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meisterschaft" (
    "id" SERIAL NOT NULL,
    "mitgliedid" INTEGER NOT NULL DEFAULT 0,
    "eventid" INTEGER NOT NULL DEFAULT 0,
    "punkte" SMALLINT DEFAULT 50,
    "wurf1" SMALLINT DEFAULT 0,
    "wurf2" SMALLINT DEFAULT 0,
    "wurf3" SMALLINT DEFAULT 0,
    "wurf4" SMALLINT DEFAULT 0,
    "wurf5" SMALLINT DEFAULT 0,
    "zusatz" INTEGER DEFAULT 5,
    "streichresultat" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),
    "total_kegel" INTEGER,

    CONSTRAINT "meisterschaft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parameter" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(45) NOT NULL,
    "value" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "parameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt" (
    "id" SERIAL NOT NULL,
    "receipt" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "jahr" VARCHAR(4),
    "bezeichnung" VARCHAR(100),

    CONSTRAINT "receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "sid" VARCHAR(45) NOT NULL,
    "userid" VARCHAR(45),
    "expires" TIMESTAMPTZ(6),
    "data" TEXT,
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "userid" VARCHAR(45) NOT NULL,
    "name" VARCHAR(500),
    "email" VARCHAR(500) NOT NULL,
    "salt" VARCHAR(500),
    "password" VARCHAR(500) NOT NULL,
    "role" VARCHAR(255) NOT NULL DEFAULT 'user',
    "last_login" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mnr_UNIQUE" ON "adressen"("mnr");

-- CreateIndex
CREATE INDEX "fki_addresse_fk" ON "adressen"("adressenid");

-- CreateIndex
CREATE INDEX "public_adressen_adresse1_idx" ON "adressen"("adresse");

-- CreateIndex
CREATE INDEX "public_adressen_fullname5_idx" ON "adressen"("fullname");

-- CreateIndex
CREATE INDEX "public_adressen_geschlecht2_idx" ON "adressen"("geschlecht");

-- CreateIndex
CREATE INDEX "public_adressen_name3_idx" ON "adressen"("name");

-- CreateIndex
CREATE INDEX "public_adressen_plz4_idx" ON "adressen"("plz");

-- CreateIndex
CREATE INDEX "fki_anlaesse_fk" ON "anlaesse"("anlaesseid");

-- CreateIndex
CREATE INDEX "public_anlaesse_datum0_idx" ON "anlaesse"("datum");

-- CreateIndex
CREATE INDEX "public_anlaesse_longname1_idx" ON "anlaesse"("longname");

-- CreateIndex
CREATE INDEX "public_budget_account1_idx" ON "budget"("account");

-- CreateIndex
CREATE UNIQUE INDEX "budget_unique" ON "budget"("account", "year");

-- CreateIndex
CREATE UNIQUE INDEX "public_budget_account0_idx" ON "budget"("account", "year");

-- CreateIndex
CREATE INDEX "fki_mitgliedId_fk" ON "clubmeister"("mitgliedid");

-- CreateIndex
CREATE INDEX "public_clubmeister_mitgliedid1_idx" ON "clubmeister"("mitgliedid");

-- CreateIndex
CREATE UNIQUE INDEX "clubmeister_unique" ON "clubmeister"("jahr", "rang");

-- CreateIndex
CREATE UNIQUE INDEX "public_clubmeister_jahr0_idx" ON "clubmeister"("jahr", "rang");

-- CreateIndex
CREATE UNIQUE INDEX "fiscalyear_unique" ON "fiscalyear"("year");

-- CreateIndex
CREATE INDEX "fki_journal_year" ON "journal"("year");

-- CreateIndex
CREATE INDEX "public_journal_from_account0_idx" ON "journal"("from_account");

-- CreateIndex
CREATE INDEX "public_journal_to_account1_idx" ON "journal"("to_account");

-- CreateIndex
CREATE UNIQUE INDEX "date_uq" ON "kegelkasse"("datum");

-- CreateIndex
CREATE INDEX "fkik_mitgliedId_fk" ON "kegelmeister"("mitgliedid");

-- CreateIndex
CREATE UNIQUE INDEX "kegelmeister_unique" ON "kegelmeister"("jahr", "rang");

-- CreateIndex
CREATE UNIQUE INDEX "eventmitglied" ON "meisterschaft"("mitgliedid", "eventid");

-- CreateIndex
CREATE UNIQUE INDEX "public_meisterschaft_mitgliedid0_idx" ON "meisterschaft"("mitgliedid", "eventid");

-- CreateIndex
CREATE UNIQUE INDEX "public_parameter_id0_idx" ON "parameter"("id");

-- CreateIndex
CREATE UNIQUE INDEX "parameter_unique" ON "parameter"("key");

-- CreateIndex
CREATE INDEX "public_parameter_key1_idx" ON "parameter"("key");

-- CreateIndex
CREATE UNIQUE INDEX "public_sessions_id0_idx" ON "sessions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "public_sessions_sid1_idx" ON "sessions"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "public_user_userid0_idx" ON "user"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "email_uq" ON "user"("email");

-- AddForeignKey
ALTER TABLE "adressen" ADD CONSTRAINT "adressen_adressenid_fkey" FOREIGN KEY ("adressenid") REFERENCES "adressen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anlaesse" ADD CONSTRAINT "anlaesse_anlaesseid_fkey" FOREIGN KEY ("anlaesseid") REFERENCES "anlaesse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_account_fkey" FOREIGN KEY ("account") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_year_fkey" FOREIGN KEY ("year") REFERENCES "fiscalyear"("year") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubmeister" ADD CONSTRAINT "clubmeister_mitgliedid_fkey" FOREIGN KEY ("mitgliedid") REFERENCES "adressen"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal" ADD CONSTRAINT "journal_from_account_fkey" FOREIGN KEY ("from_account") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal" ADD CONSTRAINT "journal_to_account_fkey" FOREIGN KEY ("to_account") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal" ADD CONSTRAINT "journal_year_fkey" FOREIGN KEY ("year") REFERENCES "fiscalyear"("year") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_receipt" ADD CONSTRAINT "journal_receipt_journalid_fkey" FOREIGN KEY ("journalid") REFERENCES "journal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_receipt" ADD CONSTRAINT "receipt_fk" FOREIGN KEY ("receiptid") REFERENCES "receipt"("id") ON DELETE CASCADE ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "kegelkasse" ADD CONSTRAINT "kegelkasse_journalid_fkey" FOREIGN KEY ("journalid") REFERENCES "journal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegelkasse" ADD CONSTRAINT "kegelkasse_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegelmeister" ADD CONSTRAINT "kegelmeister_mitgliedid_fkey" FOREIGN KEY ("mitgliedid") REFERENCES "adressen"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meisterschaft" ADD CONSTRAINT "meisterschaft_eventid_fkey" FOREIGN KEY ("eventid") REFERENCES "anlaesse"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meisterschaft" ADD CONSTRAINT "meisterschaft_mitgliedid_fkey" FOREIGN KEY ("mitgliedid") REFERENCES "adressen"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userid_fkey" FOREIGN KEY ("userid") REFERENCES "user"("userid") ON DELETE SET NULL ON UPDATE CASCADE;

