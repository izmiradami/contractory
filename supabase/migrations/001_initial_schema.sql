-- Contractory — Supabase Production Schema
-- Run via: supabase db push OR paste in Supabase SQL editor

-- ─────────────────────────────────────────────────────────────
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- USERS
create table if not exists public.users (
  id          uuid          primary key default uuid_generate_v4(),
  address     text          not null unique,    -- EVM address (lowercase)
  ens         text,                             -- ENS name (future)
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);
alter table public.users enable row level security;
-- Users can only read/update their own row
create policy "users_select_own" on public.users for select using (auth.uid()::text = id::text);
create policy "users_insert_own" on public.users for insert with check (true);
create policy "users_update_own" on public.users for update using (auth.uid()::text = id::text);

-- ─────────────────────────────────────────────────────────────
-- CONTRACTS
create table if not exists public.contracts (
  id            uuid          primary key default uuid_generate_v4(),
  owner_address text          not null,          -- deployer's wallet
  address       text          not null unique,   -- contract address (lowercase)
  chain_id      integer       not null default 72,
  name          text          not null,
  type          text          not null default 'CUSTOM',
  abi           text,                            -- JSON stringified ABI
  source_code   text,                            -- Solidity source
  bytecode      text,                            -- compiled bytecode
  verified      boolean       not null default false,
  is_favorite   boolean       not null default false,
  tags          text[]        not null default '{}',
  deployed_at   timestamptz   not null default now(),
  deployer      text          not null,
  tx_hash       text          not null unique,
  status        text          not null default 'active',
  metadata      jsonb         not null default '{}',
  health        integer       not null default 72,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);
create index if not exists contracts_owner_idx on public.contracts(owner_address);
create index if not exists contracts_chain_idx  on public.contracts(chain_id);
alter table public.contracts enable row level security;
-- Anyone can read public contracts, only owner can write
create policy "contracts_select"     on public.contracts for select using (true);
create policy "contracts_insert_own" on public.contracts for insert with check (true);
create policy "contracts_update_own" on public.contracts for update using (owner_address = lower(auth.jwt() ->> 'address'));

-- ─────────────────────────────────────────────────────────────
-- AI AGENTS (ERC-8004)
create table if not exists public.agents (
  id              uuid          primary key default uuid_generate_v4(),
  owner_address   text          not null,
  agent_id        text          not null unique,   -- on-chain keccak256
  wallet_address  text          not null,
  name            text          not null,
  description     text,
  metadata_uri    text,
  capabilities    text[]        not null default '{}',
  permissions     text[]        not null default '{}',
  status          text          not null default 'offline',
  visibility      text          not null default 'private',
  version         text          not null default 'v1.0',
  reputation      jsonb         not null default '{"overall":0,"reliability":0,"security":0,"responseTime":0,"jobsCompleted":0,"successRate":0}',
  memory          jsonb         not null default '{"recentJobs":[],"recentContracts":[],"favoriteChains":[],"knownProjects":[],"context":""}',
  chain_id        integer       not null default 72,
  tx_hash         text,
  registered_at   timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);
create index if not exists agents_owner_idx on public.agents(owner_address);
alter table public.agents enable row level security;
create policy "agents_select"     on public.agents for select using (true);
create policy "agents_insert_own" on public.agents for insert with check (true);
create policy "agents_update_own" on public.agents for update using (owner_address = lower(auth.jwt() ->> 'address'));

-- ─────────────────────────────────────────────────────────────
-- TRANSACTIONS  
create table if not exists public.transactions (
  id           uuid         primary key default uuid_generate_v4(),
  owner_address text        not null,
  tx_hash      text         not null unique,
  chain_id     integer      not null default 72,
  type         text         not null,   -- 'deploy' | 'transfer' | 'bridge' | 'swap' | 'contract_call'
  status       text         not null default 'pending',
  from_address text         not null,
  to_address   text,
  value        text,                    -- USDC amount (string to avoid precision loss)
  gas_used     text,                    -- USDC gas cost
  block_number bigint,
  confirmed_at timestamptz,
  metadata     jsonb        not null default '{}',
  created_at   timestamptz  not null default now()
);
create index if not exists tx_owner_idx  on public.transactions(owner_address);
create index if not exists tx_status_idx on public.transactions(status);
alter table public.transactions enable row level security;
create policy "tx_select_own" on public.transactions for select using (owner_address = lower(auth.jwt() ->> 'address'));
create policy "tx_insert"     on public.transactions for insert with check (true);
create policy "tx_update"     on public.transactions for update using (owner_address = lower(auth.jwt() ->> 'address'));

-- ─────────────────────────────────────────────────────────────
-- PAYMENT AUTOMATIONS
create table if not exists public.automations (
  id            uuid         primary key default uuid_generate_v4(),
  owner_address text         not null,
  name          text         not null,
  type          text         not null,   -- 'recurring' | 'payroll' | 'streaming' | 'vesting' | 'subscription' | 'escrow'
  status        text         not null default 'active',
  config        jsonb        not null default '{}',
  last_run      timestamptz,
  next_run      timestamptz,
  created_at    timestamptz  not null default now()
);
alter table public.automations enable row level security;
create policy "auto_own" on public.automations for all using (owner_address = lower(auth.jwt() ->> 'address'));

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT triggers
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger users_updated_at     before update on public.users     for each row execute function update_updated_at();
create trigger contracts_updated_at before update on public.contracts  for each row execute function update_updated_at();
create trigger agents_updated_at    before update on public.agents     for each row execute function update_updated_at();
