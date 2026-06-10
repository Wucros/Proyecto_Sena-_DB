
create table if not exists public.productos (
  id integer primary key,
  nombre text not null,
  categoria text not null check (categoria in ('consola', 'juego', 'accesorio')),
  plataforma text null check (
    plataforma is null or plataforma in ('playstation', 'xbox', 'nintendo', 'pc')
  ),
  precio integer not null,
  precio_anterior integer null,
  emoji text not null default '',
  oferta boolean not null default false,
  imagen text not null default ''
);

create index if not exists productos_categoria_idx on public.productos (categoria);
create index if not exists productos_plataforma_idx on public.productos (plataforma);

alter table public.productos enable row level security;

drop policy if exists "productos_select_publico" on public.productos;
create policy "productos_select_publico"
  on public.productos
  for select
  to anon, authenticated
  using (true);

drop policy if exists "productos_insert_publico" on public.productos;
create policy "productos_insert_publico"
  on public.productos
  for insert
  to anon, authenticated
  with check (true);

grant usage on schema public to anon, authenticated;
drop policy if exists "productos_delete_publico" on public.productos;
create policy "productos_delete_publico"
  on public.productos
  for delete
  to anon, authenticated
  using (true);

grant select, insert, delete on table public.productos to anon, authenticated;

-- Migración: columnas y categorías en tablas ya creadas
alter table public.productos
  add column if not exists emoji text not null default '';

alter table public.productos drop constraint if exists productos_categoria_check;
alter table public.productos add constraint productos_categoria_check
  check (categoria in ('consola', 'juego', 'accesorio'));

insert into public.productos (id, nombre, categoria, plataforma, precio, precio_anterior, emoji, oferta, imagen)
values
  (1, 'PlayStation 5', 'consola', NULL, 2309958, 2519958, '🎮', true, 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$facebook$'),
  (2, 'Xbox Series X', 'consola', NULL, 2099958, NULL, '🟢', false, 'https://phantom-elmundo.unidadeditorial.es/399620f3b3ae05ffa68c4c3e2bb62ccc/resize/414/f/jpg/assets/multimedia/imagenes/2019/12/13/15762254803742.jpg'),
  (3, 'Nintendo Switch 2', 'consola', NULL, 2600000, 1553958, '🔴', true, 'https://images.ecestaticos.com/SzPRLV5qwdgOn8elQ6-TWIBouw0=/673x74:2012x1078/1200x900/filters:fill(white):format(jpg)/f.elconfidencial.com%2Foriginal%2Fca4%2F1dd%2F433%2Fca41dd433fb247012cae8fce6350da64.jpg'),
  (4, 'Steam Machine', 'consola', NULL, 5000000, NULL, '🎯', false, 'https://clan.fastly.steamstatic.com/images/45479024/d2ce7e96bb0ab51817ba37cf61e3ca919d6f7209.jpg'),
  (5, 'God of War Ragnarök', 'juego', 'playstation', 167958, 293958, '🪓', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg'),
  (6, 'Spider-Man 2', 'juego', 'playstation', 293958, NULL, '🕷️', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Marvel%27s_Spider-Man_2_cover_art.jpg/220px-Marvel%27s_Spider-Man_2_cover_art.jpg'),
  (7, 'The Last of Us Part II', 'juego', 'playstation', 125958, 209958, '🧟', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/2531310/header.jpg'),
  (8, 'Ghost of Tsushima', 'juego', 'playstation', 146958, 251958, '🗾', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg'),
  (9, 'Horizon Forbidden West', 'juego', 'playstation', 188958, 293958, '🦖', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/2420110/header.jpg'),
  (10, 'Ratchet & Clank: Rift Apart', 'juego', 'playstation', 209958, NULL, '🔧', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1895880/header.jpg'),
  (11, 'Demon''s Souls', 'juego', 'playstation', 230958, 293958, '⚔️', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Demon%27s_Souls_cover_art.jpg/220px-Demon%27s_Souls_cover_art.jpg'),
  (12, 'Gran Turismo 7', 'juego', 'playstation', 209958, 251958, '🏎️', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Gran_Turismo_7_cover_art.jpg/220px-Gran_Turismo_7_cover_art.jpg'),
  (13, 'Returnal', 'juego', 'playstation', 167958, 293958, '🌀', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1649240/header.jpg'),
  (14, 'Final Fantasy XVI', 'juego', 'playstation', 230958, NULL, '⚡', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/2169380/header.jpg'),
  (15, 'Hogwarts Legacy', 'juego', 'playstation', 188958, 251958, '🪄', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg'),
  (16, 'Elden Ring', 'juego', 'playstation', 209958, 251958, '🐉', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'),
  (17, 'Forza Horizon 5', 'juego', 'xbox', 125958, 209958, '🏁', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg'),
  (18, 'Halo Infinite', 'juego', 'xbox', 146958, 251958, '🛸', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1240440/header.jpg'),
  (19, 'Starfield', 'juego', 'xbox', 293958, NULL, '🌌', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/header.jpg'),
  (20, 'Forza Motorsport', 'juego', 'xbox', 251958, NULL, '🏎️', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/2440510/header.jpg'),
  (21, 'Gears 5', 'juego', 'xbox', 83958, 167958, '🔫', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg'),
  (22, 'Sea of Thieves', 'juego', 'xbox', 146958, NULL, '🏴‍☠️', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172620/header.jpg'),
  (23, 'Microsoft Flight Simulator', 'juego', 'xbox', 209958, 293958, '✈️', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1250410/header.jpg'),
  (24, 'Hellblade II: Senua''s Saga', 'juego', 'xbox', 209958, NULL, '🔥', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817190/header.jpg'),
  (25, 'Fable', 'juego', 'xbox', 251958, NULL, '🐔', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Fable_2025_cover_art.jpg/220px-Fable_2025_cover_art.jpg'),
  (26, 'Hi-Fi Rush', 'juego', 'xbox', 104958, 125958, '🎸', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1846380/header.jpg'),
  (27, 'Psychonauts 2', 'juego', 'xbox', 125958, 167958, '🧠', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1031200/header.jpg'),
  (28, 'The Legend of Zelda: Tears of the Kingdom', 'juego', 'nintendo', 293958, NULL, '🗡️', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg/220px-The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg'),
  (29, 'Mario Kart 8 Deluxe', 'juego', 'nintendo', 230958, NULL, '🏎️', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Mario_Kart_8_Deluxe_cover_art.jpg/220px-Mario_Kart_8_Deluxe_cover_art.jpg'),
  (30, 'Animal Crossing: New Horizons', 'juego', 'nintendo', 209958, NULL, '🍃', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Animal_Crossing_New_Horizons.jpg/220px-Animal_Crossing_New_Horizons.jpg'),
  (31, 'Super Mario Odyssey', 'juego', 'nintendo', 209958, 251958, '🍄', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Super_Mario_Odyssey.jpg/220px-Super_Mario_Odyssey.jpg'),
  (32, 'Splatoon 3', 'juego', 'nintendo', 230958, NULL, '🦑', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Splatoon_3_cover_art.jpg/220px-Splatoon_3_cover_art.jpg'),
  (33, 'Pokémon Escarlata', 'juego', 'nintendo', 230958, NULL, '🦎', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Pok%C3%A9mon_Scarlet_and_Violet_cover_art.jpg/220px-Pok%C3%A9mon_Scarlet_and_Violet_cover_art.jpg'),
  (34, 'Pokémon Púrpura', 'juego', 'nintendo', 230958, NULL, '🐱', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Pok%C3%A9mon_Scarlet_and_Violet_cover_art.jpg/220px-Pok%C3%A9mon_Scarlet_and_Violet_cover_art.jpg'),
  (35, 'Metroid Dread', 'juego', 'nintendo', 209958, 251958, '👾', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/Metroid_Dread_cover_art.jpg/220px-Metroid_Dread_cover_art.jpg'),
  (36, 'Fire Emblem Engage', 'juego', 'nintendo', 230958, NULL, '⚔️', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Fire_Emblem_Engage_cover_art.jpg/220px-Fire_Emblem_Engage_cover_art.jpg'),
  (37, 'Super Smash Bros. Ultimate', 'juego', 'nintendo', 251958, NULL, '👊', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/5/50/Super_Smash_Bros._Ultimate_cover_art.jpg/220px-Super_Smash_Bros._Ultimate_cover_art.jpg'),
  (38, 'Luigi''s Mansion 3', 'juego', 'nintendo', 188958, 251958, '👻', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Luigi%27s_Mansion_3_cover_art.jpg/220px-Luigi%27s_Mansion_3_cover_art.jpg'),
  (39, 'Kirby y la Tierra Olvidada', 'juego', 'nintendo', 209958, NULL, '⭐', false, 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Kirby_and_the_Forgotten_Land_cover_art.png/220px-Kirby_and_the_Forgotten_Land_cover_art.png'),
  (40, 'Baldur''s Gate 3', 'juego', 'pc', 230958, NULL, '🐉', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg'),
  (41, 'Cyberpunk 2077', 'juego', 'pc', 125958, 209958, '🌃', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'),
  (42, 'Half-Life: Alyx', 'juego', 'pc', 209958, 251958, '🥽', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/546560/header.jpg'),
  (43, 'Counter-Strike 2', 'juego', 'pc', 0, NULL, '🔫', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg'),
  (44, 'Valheim', 'juego', 'pc', 83958, NULL, '🪓', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg'),
  (45, 'Hades', 'juego', 'pc', 104958, 125958, '⚡', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg'),
  (46, 'Stray', 'juego', 'pc', 125958, 146958, '🐱', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/1332010/header.jpg'),
  (47, 'Disco Elysium', 'juego', 'pc', 83958, 167958, '🔍', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg'),
  (48, 'Portal 2', 'juego', 'pc', 37758, 41958, '🔵', true, 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg'),
  (49, 'Hollow Knight', 'juego', 'pc', 62958, NULL, '🦗', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg'),
  (50, 'Celeste', 'juego', 'pc', 83958, NULL, '🍓', false, 'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg'),
  (51, 'DualSense Wireless Controller', 'accesorio', 'playstation', 314958, NULL, '🎮', false, 'https://gmedia.playstation.com/is/image/SIEPDC/dualsense-wireless-controller-product-thumbnail-01-en-14sep21?$facebook$'),
  (52, 'Xbox Wireless Controller', 'accesorio', 'xbox', 251958, 293958, '🟢', true, 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4F7S9'),
  (53, 'Nintendo Switch Pro Controller', 'accesorio', 'nintendo', 272958, NULL, '🔴', false, 'https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_400/ncom/en_US/switch/accessories/controllers/pro-controller'),
  (54, 'SteelSeries Arctis Nova 7', 'accesorio', NULL, 629958, 734958, '🎧', true, 'https://steelseries.com/cdn/shop/files/Arctis_Nova_7_White_01_1024x1024.png'),
  (55, 'Base de carga DualSense', 'accesorio', 'playstation', 167958, NULL, '🔋', false, 'https://gmedia.playstation.com/is/image/SIEPDC/dualsense-charging-station-product-thumbnail-01-en-14sep21?$facebook$'),
  (56, 'PlayStation Portal', 'accesorio', 'playstation', 1259958, NULL, '📱', false, 'https://gmedia.playstation.com/is/image/SIEPDC/ps-portal-product-thumbnail-01-en-08nov23?$facebook$'),
  (57, 'Joy-Con (par) Nintendo Switch', 'accesorio', 'nintendo', 314958, NULL, '🕹️', false, ''),
  (58, 'Razer BlackWidow V4', 'accesorio', 'pc', 524958, NULL, '⌨️', false, 'https://hybrismediaprod.blob.core.windows.net/sys-master-phoenix-images-container/hf3/hf3/9b2a/9b2a/9b2a9b2a-0000-0000-0000-000000000000/razer-blackwidow-v4-500x500.png')
on conflict (id) do update set
  nombre = excluded.nombre,
  categoria = excluded.categoria,
  plataforma = excluded.plataforma,
  precio = excluded.precio,
  precio_anterior = excluded.precio_anterior,
  emoji = excluded.emoji,
  oferta = excluded.oferta,
  imagen = excluded.imagen;
