db.createUser({
    user: 'admin',
    pwd: 'uMvpuI5jMo3iO5jYDtmI',
    roles: [
      {
        role: 'root',
        db: 'admin',
      },
    ],
  });
  
db.createUser({
    user: 'sb_root',
    pwd: 'VkBAVxJvTfeS6Mzp',
    roles: [
      {
        role: 'readWrite',
        db: 'sb_identity',
      },
    ],
  });
  