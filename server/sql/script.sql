create table users
(
    id              serial
        primary key,
    email           varchar(255) not null
        unique,
    collection_name varchar(255) not null
        unique,
    add_date        timestamp default CURRENT_TIMESTAMP
);

alter table users
    owner to postgres;

create table workspaces
(
    id          serial
        primary key,
    user_id     integer      not null
        references users (id)
            on delete cascade,
    name        varchar(255) not null,
    tags        text,
    description text,
    unique (user_id, name)
);

alter table workspaces
    owner to postgres;

create table file_uploads
(
    id           serial
        primary key,
    user_id      integer                             not null
        references users (id)
            on delete cascade,
    workspace_id integer                             not null
        references workspaces
            on delete cascade,
    file_name    varchar(255)                        not null,
    file_path    text,
    file_key     uuid                                not null,
    uploaded_at  timestamp default CURRENT_TIMESTAMP not null
);

alter table file_uploads
    owner to postgres;