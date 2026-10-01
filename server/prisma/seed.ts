/**
 * Fills the database with a few demo users, posts and comments.
 *
 * Run it with:  npm run db:seed
 *
 * It clears the existing data first, so it is safe to run more than once.
 * The demo password below only ever exists in this file - the application
 * itself never contains a hard-coded password.
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123';

const USERS = [
  { name: 'Alice Johnson', email: 'alice@example.com' },
  { name: 'Bob Smith', email: 'bob@example.com' },
  { name: 'Carol Diaz', email: 'carol@example.com' },
];

const POSTS = [
  {
    authorEmail: 'alice@example.com',
    title: 'Getting Started with React Hooks',
    content: `React Hooks changed how we write components, but the idea behind them is simple: they let you use state and other React features without splitting your code into tiny classes.

The most important hook is useState. It gives you a piece of state and a function to update it. Calling that function tells React to re-render your component with the new value.

\`\`\`tsx
const [count, setCount] = useState(0);

return <button onClick={() => setCount(count + 1)}>
  Clicked {count} times
</button>;
\`\`\`

Use useEffect when you need to synchronise with something outside React, like a subscription or a browser API. Keep an eye on its dependency array so you are not re-running work on every render.

Once those two make sense, reach for useMemo and useCallback when you have a genuine performance problem - not before.`,
  },
  {
    authorEmail: 'bob@example.com',
    title: 'How PostgreSQL Indexes Actually Work',
    content: `An index in PostgreSQL is a separate data structure that keeps certain rows easy to find. Without one, the database has to read every row in a table to answer your query, which is called a sequential scan.

With one, the database can jump straight to the matching rows. That is why an index on a column you filter or join on is almost always worth creating.

A few things worth knowing:

- Indexes speed up reads but slow down writes, because every insert has to update them too.
- An index only gets used when the planner thinks it will help. Check with EXPLAIN ANALYZE.
- Composite indexes follow left-to-right column order, so put the column you filter on most first.

Indexes are one of the cheapest big wins in a slow application.`,
  },
  {
    authorEmail: 'carol@example.com',
    title: 'Writing a REST API People Enjoy Using',
    content: `A good API is predictable. If you know one endpoint of a service, you can guess the rest.

That mostly comes down to consistency:

- Use nouns for resources and HTTP verbs for actions. GET /api/posts, POST /api/posts.
- Return the same JSON envelope every time, so clients need one parser.
- Use the status codes properly. 201 for created, 400 for bad input, 401 for not signed in, 403 for not allowed, 404 for missing.
- Never return a password hash, not even by accident.

The envelope this blog uses looks like this:

\`\`\`json
{ "success": true, "message": "Here are the latest posts.", "data": { "posts": [] } }
\`\`\`

Errors look the same, minus the data:

\`\`\`json
{ "success": false, "message": "Incorrect email or password." }
\`\`\`

Consistency is not glamorous, but it is what makes an API pleasant to build against.`,
  },
  {
    authorEmail: 'alice@example.com',
    title: 'Why I Stopped Writing Everything in JavaScript',
    content: `For years every part of my project was JavaScript, and honestly it worked fine. Then things started breaking in ways that were annoying to debug.

The most common culprit was a typo in a property name. Nothing warned you about it. The value was simply undefined three frames later, in a completely unrelated function.

TypeScript would have caught that immediately. It is not a different language - it compiles to the same JavaScript - it just understands the shape of your data.

I did not have to change my coding style to benefit. I added annotations to function arguments and return values, turned them on file by file, and let inference handle the rest.

My rule now: annotate anything crossing a boundary, and let the compiler do the rest.`,
  },
  {
    authorEmail: 'bob@example.com',
    title: 'A Practical Guide to Password Hashing',
    content: `Never store a password the way the user typed it. If your database leaks, every account leaks with it.

The fix is to hash the password with bcrypt. Hashing is one-way by design: you can check whether an input matches a stored hash, but you cannot work backwards from the hash to the password.

Two things make bcrypt a good default:

- It is deliberately slow, which makes guessing passwords expensive for an attacker.
- It automatically salts each hash, so two users with the same password get different hashes.

In Node.js it takes one line:

\`\`\`ts
const hash = await bcrypt.hash(password, 10);
const ok = await bcrypt.compare(attempt, hash);
\`\`\`

Always hash on the way in, compare on the way through, and never return the hash in a response.`,
  },
];

const COMMENTS = [
  {
    postTitle: 'Getting Started with React Hooks',
    authorEmail: 'bob@example.com',
    content: 'The useEffect dependency array tripped me up for ages. Watching it in a debugger finally made it click.',
  },
  {
    postTitle: 'Getting Started with React Hooks',
    authorEmail: 'carol@example.com',
    content: 'Great point about reaching for useMemo only when there is a real problem. Optimising everything up front just adds noise.',
  },
  {
    postTitle: 'Getting Started with React Hooks',
    authorEmail: 'alice@example.com',
    content: 'Glad it helped! The class-to-hooks comparison is what made it stick for me too.',
  },
  {
    postTitle: 'How PostgreSQL Indexes Actually Work',
    authorEmail: 'carol@example.com',
    content: 'The left-to-right column order detail on composite indexes cost me an afternoon once. Good to have it written down.',
  },
  {
    postTitle: 'How PostgreSQL Indexes Actually Work',
    authorEmail: 'alice@example.com',
    content: 'EXPLAIN ANALYZE is such a good habit. Took me two seconds to find a missing index on a slow query.',
  },
  {
    postTitle: 'How PostgreSQL Indexes Actually Work',
    authorEmail: 'bob@example.com',
    content: 'Adding an index made our feed query roughly twenty times faster. Cheapest win of the year.',
  },
  {
    postTitle: 'A Practical Guide to Password Hashing',
    authorEmail: 'alice@example.com',
    content: 'Worth adding that you should also add a rate limit to the login endpoint. Hashing is not the only defence.',
  },
  {
    postTitle: 'Writing a REST API People Enjoy Using',
    authorEmail: 'alice@example.com',
    content: 'The single envelope thing is underrated. It saves a lot of repetitive code on the client.',
  },
  {
    postTitle: 'Writing a REST API People Enjoy Using',
    authorEmail: 'bob@example.com',
    content: 'Returning 403 for a resource that is not yours, and 404 when it does not exist at all, is a nice detail.',
  },
  {
    postTitle: 'Why I Stopped Writing Everything in JavaScript',
    authorEmail: 'carol@example.com',
    content: 'The "annotate boundaries, let inference handle the rest" approach is how I got my team onto it too.',
  },
];

async function main() {
  console.log('[seed] Clearing existing data...');
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('[seed] Hashing the demo password...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log('[seed] Creating users...');
  const usersByEmail = new Map<string, { id: string }>();

  for (const user of USERS) {
    const created = await prisma.user.create({
      data: { name: user.name, email: user.email, password: passwordHash },
      select: { id: true, email: true },
    });
    usersByEmail.set(created.email, created);
  }

  console.log('[seed] Creating posts...');
  const postsByTitle = new Map<string, { id: string }>();

  for (const post of POSTS) {
    const author = usersByEmail.get(post.authorEmail);
    if (!author) throw new Error(`Seed error: unknown author ${post.authorEmail}`);

    const created = await prisma.post.create({
      data: { title: post.title, content: post.content, authorId: author.id },
      select: { id: true, title: true },
    });
    postsByTitle.set(created.title, created);
  }

  console.log('[seed] Creating comments...');
  for (const comment of COMMENTS) {
    const author = usersByEmail.get(comment.authorEmail);
    const post = postsByTitle.get(comment.postTitle);
    if (!author || !post) {
      throw new Error(`Seed error: could not resolve "${comment.postTitle}" / ${comment.authorEmail}`);
    }

    await prisma.comment.create({
      data: { content: comment.content, authorId: author.id, postId: post.id },
    });
  }

  const [userCount, postCount, commentCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
  ]);

  console.log('\n[seed] Done.');
  console.log(`[seed]   ${userCount} users, ${postCount} posts, ${commentCount} comments`);
  console.log('[seed] Sign in with any of these (password is the same for all):');
  for (const user of USERS) {
    console.log(`[seed]     ${user.email}  /  ${DEMO_PASSWORD}`);
  }
  console.log('');
}

main()
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });