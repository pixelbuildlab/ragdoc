--
-- PostgreSQL database dump
--

\restrict 4g2SO2NebSAf8FZ53kRZKU9llzZfznTrwkSSA22McAevdhuXJWzpxgTxFaXPxgS

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: file_uploads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_uploads (
    id integer NOT NULL,
    user_id integer NOT NULL,
    workspace_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path text,
    file_key uuid NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.file_uploads OWNER TO postgres;

--
-- Name: file_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_uploads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_uploads_id_seq OWNER TO postgres;

--
-- Name: file_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_uploads_id_seq OWNED BY public.file_uploads.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    collection_name character varying(255) NOT NULL,
    add_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workspaces (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    tags text,
    description text
);


ALTER TABLE public.workspaces OWNER TO postgres;

--
-- Name: workspaces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workspaces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspaces_id_seq OWNER TO postgres;

--
-- Name: workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workspaces_id_seq OWNED BY public.workspaces.id;


--
-- Name: file_uploads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads ALTER COLUMN id SET DEFAULT nextval('public.file_uploads_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workspaces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces ALTER COLUMN id SET DEFAULT nextval('public.workspaces_id_seq'::regclass);


--
-- Data for Name: file_uploads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_uploads (id, user_id, workspace_id, file_name, file_path, file_key, uploaded_at) FROM stdin;
55	7	10	M.Waqar - Full Stack Developer.pdf	uploads/7/10/M.Waqar - Full Stack Developer.pdf	6f5019bd-d8ec-4560-876f-43e9ba4eabc9	2026-04-10 01:08:47.692652
56	7	10	M.Waqar-AI-ML.pdf	uploads/7/10/M.Waqar-AI-ML.pdf	89e02147-d6cc-4565-882f-be44b45f01a6	2026-04-10 01:09:01.209771
57	7	11	Employee Handbook Final 2026 (1).pdf	uploads/7/11/Employee Handbook Final 2026 (1).pdf	5bfb001c-9a4f-46df-8adc-e04adb23ff17	2026-04-10 01:16:21.399373
58	7	12	Global_Reach.pdf	uploads/7/12/Global_Reach.pdf	c2805548-10b9-4fb9-8d16-f59448c27d93	2026-04-10 08:46:16.979664
59	7	14	ko260302a1.pdf	uploads/7/14/ko260302a1.pdf	c9a92899-e11b-48b2-878c-e0f59b1231df	2026-04-10 09:26:04.864075
60	7	14	pak_economy_2026.pdf	uploads/7/14/pak_economy_2026.pdf	f6faaa40-c7a9-49e9-a600-e186da6577a2	2026-04-10 09:26:34.934545
61	7	14	070d119b-en.pdf	uploads/7/14/070d119b-en.pdf	a64dd3a1-111d-4c4c-8160-20df9aaff992	2026-04-10 09:32:16.83012
62	7	12	a2-reference-guide-012825.pdf	uploads/7/12/a2-reference-guide-012825.pdf	962c06f6-273a-43ce-beee-2dd217a5debe	2026-04-10 10:51:33.003339
63	7	13	ExerciseBook.pdf	uploads/7/13/ExerciseBook.pdf	28939fc4-20a2-4665-aef0-af6cf993a78c	2026-04-10 22:30:32.29428
64	7	13	ebook_8WeekShred.pdf	uploads/7/13/ebook_8WeekShred.pdf	02d14d42-48bd-440b-a922-dcdf390778bf	2026-04-10 22:31:17.992496
65	8	17	zayan.pdf	uploads/8/17/zayan.pdf	193b5e95-45e0-4b52-aafd-0207f12b29a7	2026-04-12 10:14:47.212012
66	8	16	AI-Studio-247-Job-Brief-B-Modules-2-5.docx.pdf	uploads/8/16/AI-Studio-247-Job-Brief-B-Modules-2-5.docx.pdf	fce6ea36-161b-45ca-99a1-cd84f82eb856	2026-04-12 10:28:06.316609
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, collection_name, add_date) FROM stdin;
7	waqardanish1@gmail.com	rag_document_collection_user_3ce72e53-32f8-449d-84cd-92d9e0e7b174	2026-04-10 01:01:31.334181
8	stelin990@gmail.com	rag_document_collection_user_298d7aef-d163-4ba9-8c35-5a0738fb2444	2026-04-12 10:13:04.987005
\.


--
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workspaces (id, user_id, name, tags, description) FROM stdin;
9	7	default		default workspace
10	7	me	me, self	personal
11	7	allzone	hr,company	handbook
12	7	Nasa	nasa, global, space	Nasa PDF processing
13	7	Workout	gym, workout	gym motiviation health
14	7	Economy	economy, wealth, countries	Country economy discussions and review
15	7	hrm	hrm, hr	workspace for hrm
16	8	default		default workspace
17	8	test	test, verfiy	testing
\.


--
-- Name: file_uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.file_uploads_id_seq', 66, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: workspaces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workspaces_id_seq', 17, true);


--
-- Name: file_uploads file_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT file_uploads_pkey PRIMARY KEY (id);


--
-- Name: users users_collection_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_collection_name_key UNIQUE (collection_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_user_id_name_key UNIQUE (user_id, name);


--
-- Name: file_uploads file_uploads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT file_uploads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: file_uploads file_uploads_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT file_uploads_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 4g2SO2NebSAf8FZ53kRZKU9llzZfznTrwkSSA22McAevdhuXJWzpxgTxFaXPxgS

