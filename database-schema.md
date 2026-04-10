Destiny Childress
web-app.db
Tables: Users, posts, messages, friendships, groups

## Overview
This describes core data structure of the web application, including users, posts, and other related data.

## 1. Users
This stores user account information.

Columns: id, firstName, lastName, email, password, school_level, disability, bio, created_at, updated_at
JSON Format{
    id: int primary key autoincrement,
    firstName: text not null,
    lastName: text not null,
    email: text not null unique,
    password: text not null,
    school_level: text,
    disability: string,
    bio: text,
    created_at: datetime default current_timestamp,
    updated_at: datetime default current_timestamp
}

## 2. Posts
This stores user-generated content.
 
Columns: id, user_id, content, created_at
JSON Format{
    id: int primary key autoincrement,
    user_id: int not null,
    content: text not null,
    created_at: datetime default current_timestamp,

    foreign key (user_id) references Users(id) on delete cascade
}

## 3. Messages
This stores the private messages between two users.

Columns: id, sender_id, receiver_id, message, created_at
JSON Format{
    id: int primary key autoincrement,
    sender_id: int not null,
    receiver_id: int not null,
    message: text not null,
    created_at: datetime default current_timestamp,

    foreign key (sender_id) references Users(id) on delete cascade,
    foreign key (receiver_id) references Users(id) on delete cascade
}

## 4. Friendships
This keeps track of user friendships.

Columns: id, requester_id, receiver_id, status, created_at
JSON Format{
    id: int primary key autoincrement,
    requester_id: int not null,
    receiver_id: int not null,
    status: text,
    created_at: datetime default current_timestamp,

    foreign key (requester_id) references Users(id) on delete cascade,
    foreign key (receiver_id) references Users(id) on delete cascade,

    unique (requester_id, receiver_id)
}

## 5. Groups
Stores information about user groups or communities.

Columns: id, name, description, owner_id, created_at
JSON Format{
    id: int primary key autoincrement,
    name: text not null,
    description: text,
    owner_id: int not null,
    created_at: datetime default current_timestamp,

    foreign key (owner_id) references Users(id) on delete cascade
}

## 6. Group members
Stores information about user group members.

Columns: id, group_id, user_id, joined_at
JSON Format{
    id: int primary key autoincrement,
    group_id: int not null,
    user_id: int not null,
    joined_at: datetime default current_timestamp,

    foreign key (group_id) references Groups(id) on delete cascade
    foreign key (user_id) references Users(id) on delete cascade

    unique (group_id, user_id)
}

//npm run server