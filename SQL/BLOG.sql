-- Create the home table if it does not exist
CREATE TABLE IF NOT EXISTS public.home
(
    id integer NOT NULL DEFAULT nextval('home_id_seq'::regclass),
    title character varying(100) COLLATE pg_catalog."default",
    content character varying(500) COLLATE pg_catalog."default",
    author character varying(25) COLLATE pg_catalog."default",
    "time" date,
    CONSTRAINT home_pkey PRIMARY KEY (id)
);


-- Fetch all posts from the home table
SELECT * FROM public.home;

-- Fetch all table names in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name; 

-- Fetch a specific post by ID
SELECT * FROM home WHERE id = :post_id;

-- Insert a new post into the home table
INSERT INTO home (title, content, author, time) 
VALUES (:title, :content, :author, :time) 
RETURNING *;

-- Update an existing post by ID
UPDATE home 
SET title = COALESCE(:title, title), 
    content = COALESCE(:content, content), 
    author = COALESCE(:author, author) 
WHERE id = :post_id 
RETURNING *;

-- Delete a post by ID
DELETE FROM home 
WHERE id = :post_id 
RETURNING *;

-- Create a new table with inheritance from the home table
CREATE TABLE IF NOT EXISTS public.new_table_name (
   -- Define specific columns if needed
) INHERITS (public.home) TABLESPACE pg_default;
