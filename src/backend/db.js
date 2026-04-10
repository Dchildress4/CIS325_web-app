import sqlite3 from 'sqlite3';

sqlite3.verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }

  console.log("Connected to SQLite database.");

  db.run("PRAGMA foreign_keys = ON");
});

//Users
db.serialize(() => {

  db.run(`
    create table if not exists users (
      id integer primary key autoincrement,
      firstName text not null,
      lastName text not null,
      email text not null unique,
      password text not null,
      school_level text,
      interests text,
      disability text,
      bio text,
      created_at datetime default current_timestamp,
      updated_at datetime default current_timestamp
    )
  `);

  //Posts
  db.run(`
    create table if not exists posts (
      id  integer primary key autoincrement,
      user_id integer,
      content text,
      created_at datetime default current_timestamp,
      updated_at datetime default current_timestamp,
      foreign key(user_id) references users(id) on delete cascade
    )
  `);

  //Messages
  db.run(`
    create table if not exists messages (
      id integer primary key autoincrement,
      sender_id integer,
      receiver_id integer,
      message text,
      created_at datetime default current_timestamp,
      is_read integer default 0,
      foreign key(sender_id) references users(id) on delete cascade,
      foreign key(receiver_id) references users(id) on delete cascade
    )
  `);

  //Friendships
  db.run(`
    create table if not exists friendships (
      id integer primary key autoincrement,
      requester_id integer,
      receiver_id integer,
      status text check(status in ('pending', 'accepted', 'blocked')) default 'pending',
      created_at datetime default current_timestamp,
      foreign key(requester_id) references users(id) on delete cascade,
      foreign key(receiver_id) references users(id) on delete cascade,
      unique(requester_id, receiver_id)
    )
  `);

  //Groups
  db.run(`
    create table if not exists groups (
      id integer primary key autoincrement,
      name text,
      description text,
      owner_id integer,
      created_at datetime default current_timestamp,
      foreign key(owner_id) references users(id) on delete cascade,
      is_private integer default 0
    )
  `);
  
  //Group members
  db.run(`
    create table if not exists group_members (
      id integer primary key autoincrement,
      group_id integer not null,
      user_id integer not null,
      role text default 'member',
      joined_at datetime default current_timestamp,
      foreign key(group_id) references groups(id) on delete cascade,
      foreign key(user_id) references users(id) on delete cascade,
      unique(group_id, user_id)
    )
  `);
});

export default db;