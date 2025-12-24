--
-- PostgreSQL database dump
--

\restrict agLxkiGv8AFGNjz3U4U1nmbMdOOf2ycllFgx4ULcbg0FwAaPyBooqjqbR8Fcod1

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Books_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Books_status" AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public."enum_Books_status" OWNER TO postgres;

--
-- Name: enum_Loans_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Loans_status" AS ENUM (
    'active',
    'returned',
    'overdue'
);


ALTER TYPE public."enum_Loans_status" OWNER TO postgres;

--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'admin',
    'bibliotecar',
    'autor',
    'student',
    'profesor'
);


ALTER TYPE public."enum_Users_role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Books" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    isbn character varying(255),
    publisher character varying(255),
    publication_year integer,
    edition character varying(255),
    category character varying(255),
    image_url character varying(255),
    description text,
    download_allowed boolean DEFAULT false,
    status public."enum_Books_status" DEFAULT 'draft'::public."enum_Books_status",
    total_stock integer DEFAULT 1,
    available_stock integer DEFAULT 1,
    view_count integer DEFAULT 0,
    download_count integer DEFAULT 0,
    loan_count integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    author_id integer,
    pdf_path character varying(255)
);


ALTER TABLE public."Books" OWNER TO postgres;

--
-- Name: Books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Books_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Books_id_seq" OWNER TO postgres;

--
-- Name: Books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Books_id_seq" OWNED BY public."Books".id;


--
-- Name: Loans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Loans" (
    id integer NOT NULL,
    loan_date timestamp with time zone,
    return_due_date timestamp with time zone NOT NULL,
    actual_return_date timestamp with time zone,
    status public."enum_Loans_status" DEFAULT 'active'::public."enum_Loans_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    user_id integer,
    book_id integer
);


ALTER TABLE public."Loans" OWNER TO postgres;

--
-- Name: Loans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Loans_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Loans_id_seq" OWNER TO postgres;

--
-- Name: Loans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Loans_id_seq" OWNED BY public."Loans".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public."enum_Users_role" DEFAULT 'student'::public."enum_Users_role",
    phone character varying(255),
    faculty character varying(255),
    student_code character varying(255),
    specialization character varying(255),
    year_of_study integer,
    "group" character varying(255),
    credits integer DEFAULT 0,
    exam_status boolean DEFAULT true,
    "isActive" boolean DEFAULT true,
    otp_code character varying(255),
    otp_expires timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    created_by integer
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Books id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Books" ALTER COLUMN id SET DEFAULT nextval('public."Books_id_seq"'::regclass);


--
-- Name: Loans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Loans" ALTER COLUMN id SET DEFAULT nextval('public."Loans_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Data for Name: Books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Books" (id, title, isbn, publisher, publication_year, edition, category, image_url, description, download_allowed, status, total_stock, available_stock, view_count, download_count, loan_count, "createdAt", "updatedAt", author_id, pdf_path) FROM stdin;
4	Sa te Mut	978-630-319-258-1	Litera	2023		Autori Români	uploads/cover-1766481218949-520903918.png	A 3-a carte	f	published	1	0	0	0	5	2025-12-23 11:13:39.008+02	2025-12-23 16:54:52.071+02	8	uploads/978-630-319-258-1-bookFile-2025-12-23-1766492279780.pdf
3	Suge-o, Andrei!	9786063313943	Litera	2017		Autori Români	uploads/cover-1766480746694-819888829.png	Continuarea carții Suge-o, Ramona!	f	published	1	0	0	0	3	2025-12-23 11:05:46.7+02	2025-12-24 09:49:10.46+02	8	uploads/bookFile-1766480746695-268183884.pdf
6	Carte test Demo		Danubius	2025	1	Literatură română	uploads/default_cover.png	Carte de test fizica	f	published	9	8	0	0	3	2025-12-24 08:20:17.21+02	2025-12-24 09:53:26.445+02	8	\N
2	Suge-o, Ramona!	9786067192872	Trei	2021		Autori Români	uploads/cover-1766478923667-253046811.jpg		f	published	1	0	0	0	6	2025-12-23 10:35:23.678+02	2025-12-24 09:53:29.246+02	8	uploads/bookFile-1766478923671-990416123.pdf
\.


--
-- Data for Name: Loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Loans" (id, loan_date, return_due_date, actual_return_date, status, "createdAt", "updatedAt", user_id, book_id) FROM stdin;
1	2025-12-23 11:59:54.884+02	2026-01-06 11:59:54.884+02	2025-12-23 12:00:44.373+02	returned	2025-12-23 11:59:54.884+02	2025-12-23 12:00:44.373+02	6	4
2	2025-12-23 12:01:52.458+02	2026-01-06 12:01:52.458+02	2025-12-23 13:32:00.375+02	returned	2025-12-23 12:01:52.458+02	2025-12-23 13:32:00.376+02	6	4
5	2025-12-23 13:36:50.604+02	2026-01-06 13:36:50.604+02	2025-12-23 16:54:47.393+02	returned	2025-12-23 13:36:50.604+02	2025-12-23 16:54:47.393+02	6	4
4	2025-12-23 13:36:45.25+02	2026-01-06 13:36:45.25+02	2025-12-24 08:06:31.483+02	returned	2025-12-23 13:36:45.25+02	2025-12-24 08:06:31.483+02	6	2
6	2025-12-23 13:41:36.576+02	2026-01-06 13:41:36.576+02	2025-12-24 08:06:35.427+02	returned	2025-12-23 13:41:36.576+02	2025-12-24 08:06:35.428+02	6	3
14	2025-12-23 16:54:52.068+02	2026-01-13 16:54:52.068+02	2025-12-24 08:11:38.371+02	returned	2025-12-23 16:54:52.068+02	2025-12-24 08:11:38.371+02	6	4
10	2025-12-23 15:13:38.64+02	2026-01-20 15:13:38.64+02	2025-12-23 15:28:18.479+02	returned	2025-12-23 15:13:38.64+02	2025-12-23 15:28:18.479+02	6	\N
13	2025-12-23 16:41:30.847+02	2026-01-06 16:41:30.846+02	2025-12-24 08:06:42.162+02	returned	2025-12-23 16:41:30.847+02	2025-12-24 08:06:42.162+02	6	\N
15	2025-12-24 08:24:23.976+02	2026-01-07 08:24:23.976+02	2025-12-24 08:24:45.274+02	returned	2025-12-24 08:24:23.976+02	2025-12-24 08:24:45.275+02	6	6
16	2025-12-24 08:44:25.019+02	2026-01-07 08:44:25.019+02	2025-12-24 08:57:15.327+02	returned	2025-12-24 08:44:25.019+02	2025-12-24 08:57:15.327+02	6	\N
17	2025-12-24 08:44:28.103+02	2026-01-07 08:44:28.103+02	2025-12-24 09:12:38.787+02	returned	2025-12-24 08:44:28.103+02	2025-12-24 09:12:38.787+02	6	2
18	2025-12-24 08:44:32.178+02	2026-01-14 08:44:32.178+02	2025-12-24 09:12:47.453+02	returned	2025-12-24 08:44:32.178+02	2025-12-24 09:12:47.453+02	6	\N
19	2025-12-24 08:44:35.59+02	2026-01-07 08:44:35.59+02	2025-12-24 09:12:49.076+02	returned	2025-12-24 08:44:35.59+02	2025-12-24 09:12:49.076+02	6	\N
20	2025-12-24 08:44:38.651+02	2026-01-07 08:44:38.651+02	2025-12-24 09:12:50.449+02	returned	2025-12-24 08:44:38.651+02	2025-12-24 09:12:50.449+02	6	\N
21	2025-12-24 08:44:45.499+02	2026-01-07 08:44:45.499+02	2025-12-24 09:12:52.126+02	returned	2025-12-24 08:44:45.499+02	2025-12-24 09:12:52.126+02	6	\N
22	2025-12-24 08:44:58.963+02	2026-01-07 08:44:58.963+02	2025-12-24 09:43:21.374+02	returned	2025-12-24 08:44:58.963+02	2025-12-24 09:43:21.375+02	6	6
3	2025-12-23 12:11:48.215+02	2026-01-13 12:11:48.215+02	2025-12-23 13:35:51.632+02	returned	2025-12-23 12:11:48.215+02	2025-12-23 13:35:51.632+02	\N	2
9	2025-12-23 13:51:06.722+02	2026-01-06 13:51:06.722+02	2025-12-23 15:27:53.882+02	returned	2025-12-23 13:51:06.722+02	2025-12-23 15:27:53.882+02	\N	2
7	2025-12-23 13:50:57.341+02	2026-01-06 13:50:57.341+02	2025-12-24 08:06:33.746+02	returned	2025-12-23 13:50:57.341+02	2025-12-24 08:06:33.746+02	\N	3
8	2025-12-23 13:51:03.683+02	2026-01-06 13:51:03.683+02	2025-12-24 08:06:36.959+02	returned	2025-12-23 13:51:03.683+02	2025-12-24 08:06:36.96+02	\N	4
12	2025-12-23 16:32:02.819+02	2026-01-06 16:32:02.819+02	2025-12-24 08:06:40.347+02	returned	2025-12-23 16:32:02.819+02	2025-12-24 08:06:40.347+02	\N	2
11	2025-12-23 16:31:56.261+02	2026-01-06 16:31:56.261+02	2025-12-24 08:06:38.653+02	returned	2025-12-23 16:31:56.261+02	2025-12-24 08:06:38.653+02	\N	\N
23	2025-12-24 09:49:10.458+02	2026-01-14 09:49:10.458+02	\N	active	2025-12-24 09:49:10.458+02	2025-12-24 09:53:12.781+02	6	3
24	2025-12-24 09:53:26.439+02	2026-01-07 09:53:26.439+02	\N	active	2025-12-24 09:53:26.439+02	2025-12-24 09:53:26.439+02	6	6
25	2025-12-24 09:53:29.241+02	2026-01-07 09:53:29.241+02	\N	active	2025-12-24 09:53:29.241+02	2025-12-24 09:53:29.241+02	6	2
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, name, email, password, role, phone, faculty, student_code, specialization, year_of_study, "group", credits, exam_status, "isActive", otp_code, otp_expires, "createdAt", "updatedAt", created_by) FROM stdin;
6	Student 1	student@mi2.ro	$2b$10$LnEz7Wr.9IbBaJbY4RxoquAJgdtmj7bPJ1d3H2ngDizdMMGMK7gu2	student	\N	Media, Design si Tehnologie	MA2024	\N	2	71	120	t	t	\N	\N	2025-12-22 16:28:43.592+02	2025-12-24 09:49:06.619+02	10
10	Profesor1	profesor@mi2.ro	$2b$10$poLHvT0W7ouZN.RMikSVcub0x76art2fU5bKNKyV4eUnyL5J/LV3e	profesor	\N	\N	\N	\N	\N	\N	0	t	t	\N	\N	2025-12-23 11:20:43.618+02	2025-12-24 09:49:29.903+02	\N
8	Andrei Ciobanu	autor@mi2.ro	$2b$10$WsSQRg.Zo4zPs/bHiO7GP.U2630ALCnwBMNE/PG1rSlxquj3bTOsu	autor	\N			\N	\N	\N	0	t	t	\N	\N	2025-12-22 16:37:49.276+02	2025-12-24 09:54:12.228+02	\N
24	Administrator	cumperiorice@gmail.com	$2b$10$h6jq.mLwu/2HXvkJB152J.XUhBaJAUcZ99Px2E527fTj79XAOsyPe	admin	\N	\N	\N	\N	\N	\N	0	t	t	\N	2025-12-24 13:36:43.779+02	2025-12-24 13:31:43.824+02	2025-12-24 13:33:14.891+02	\N
5	Administrator 1	contact@mi2.ro	$2b$10$1H0xrxPQfBD/igH5FSbSVuPQ7XVxkjLjAgOK1LSSbQgq00cog3xgi	admin	\N			\N	\N	\N	0	t	t	\N	\N	2025-12-22 16:19:42.944+02	2025-12-24 09:32:51.395+02	\N
9	Bibliotecar	bibliotecar@mi2.ro	$2b$10$e00POsWSBmBWHyALDbo35uXGhah4x7cBMjqTgfOYS3K078alnbDfO	bibliotecar	\N			\N	\N	\N	0	t	t	\N	\N	2025-12-22 17:07:03.866+02	2025-12-24 09:43:14.862+02	\N
\.


--
-- Name: Books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Books_id_seq"', 20, true);


--
-- Name: Loans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Loans_id_seq"', 25, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 24, true);


--
-- Name: Books Books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Books"
    ADD CONSTRAINT "Books_pkey" PRIMARY KEY (id);


--
-- Name: Loans Loans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Loans"
    ADD CONSTRAINT "Loans_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_email_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key1" UNIQUE (email);


--
-- Name: Users Users_email_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key10" UNIQUE (email);


--
-- Name: Users Users_email_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key11" UNIQUE (email);


--
-- Name: Users Users_email_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key12" UNIQUE (email);


--
-- Name: Users Users_email_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key13" UNIQUE (email);


--
-- Name: Users Users_email_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key14" UNIQUE (email);


--
-- Name: Users Users_email_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key15" UNIQUE (email);


--
-- Name: Users Users_email_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key16" UNIQUE (email);


--
-- Name: Users Users_email_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key17" UNIQUE (email);


--
-- Name: Users Users_email_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key18" UNIQUE (email);


--
-- Name: Users Users_email_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key19" UNIQUE (email);


--
-- Name: Users Users_email_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key2" UNIQUE (email);


--
-- Name: Users Users_email_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key20" UNIQUE (email);


--
-- Name: Users Users_email_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key21" UNIQUE (email);


--
-- Name: Users Users_email_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key22" UNIQUE (email);


--
-- Name: Users Users_email_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key23" UNIQUE (email);


--
-- Name: Users Users_email_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key24" UNIQUE (email);


--
-- Name: Users Users_email_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key25" UNIQUE (email);


--
-- Name: Users Users_email_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key26" UNIQUE (email);


--
-- Name: Users Users_email_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key27" UNIQUE (email);


--
-- Name: Users Users_email_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key28" UNIQUE (email);


--
-- Name: Users Users_email_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key3" UNIQUE (email);


--
-- Name: Users Users_email_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key4" UNIQUE (email);


--
-- Name: Users Users_email_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key5" UNIQUE (email);


--
-- Name: Users Users_email_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key6" UNIQUE (email);


--
-- Name: Users Users_email_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key7" UNIQUE (email);


--
-- Name: Users Users_email_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key8" UNIQUE (email);


--
-- Name: Users Users_email_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key9" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Books Books_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Books"
    ADD CONSTRAINT "Books_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Loans Loans_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Loans"
    ADD CONSTRAINT "Loans_book_id_fkey" FOREIGN KEY (book_id) REFERENCES public."Books"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Loans Loans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Loans"
    ADD CONSTRAINT "Loans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Users Users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."Users"(id);


--
-- PostgreSQL database dump complete
--

\unrestrict agLxkiGv8AFGNjz3U4U1nmbMdOOf2ycllFgx4ULcbg0FwAaPyBooqjqbR8Fcod1

