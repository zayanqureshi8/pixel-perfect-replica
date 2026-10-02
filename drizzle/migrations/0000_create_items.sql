CREATE TYPE public.item_kind AS ENUM ('lost','found');
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.item_kind NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  category text NOT NULL CHECK (category IN ('ID Card','Wallet','Electronics','Books','Bag','Keys','Water Bottle','Other')),
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 1000),
  location text NOT NULL CHECK (char_length(location) BETWEEN 1 AND 120),
  item_date date NOT NULL,
  image_url text,
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 3 AND 160),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can report items" ON public.items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX items_kind_idx ON public.items(kind, created_at DESC);

CREATE POLICY "Public read item images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'item-images');
CREATE POLICY "Anyone upload item images" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'item-images');