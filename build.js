const fs = require('fs');
const path = require('path');

const { parseFrontmatter } = require('./lib/frontmatter');
const { markdownToHtml } = require('./lib/markdown');
const { renderLayout, renderListPage, renderPostPage } = require('./lib/templates');
const { excerptFromHtml } = require('./lib/html-utils');

const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, 'posts');
const PUBLIC_DIR = path.join(ROOT, 'public');
const APPS_DIR = path.join(ROOT, 'apps');
const DIST_DIR = path.join(ROOT, 'dist');

// 미니 웹앱 포트폴리오 목록. 새 앱을 Embed할 때 여기에 항목을 추가한다.
const APPS = [
  {
    name: '2048',
    title: '2048',
    description: '방향키(또는 스와이프)로 숫자 타일을 밀어서 합치는 퍼즐 게임. 점수판 포함.',
  },
  {
    name: 'pomodoro',
    title: '뽀모도로 타이머',
    description: '집중 시간과 쉬는 시간을 슬라이더로 직접 조정할 수 있는 뽀모도로 타이머.',
  },
];

function copyAppAssets(appName) {
  const srcDir = path.join(APPS_DIR, appName);
  const destDir = path.join(DIST_DIR, 'apps', appName);
  fs.mkdirSync(destDir, { recursive: true });
  const files = fs.readdirSync(srcDir).filter((f) => /\.(html|css|js)$/.test(f));
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
}

function deriveSlug(filename, data) {
  if (data.slug) return data.slug;
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function build() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(DIST_DIR, 'posts'), { recursive: true });

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));

  const posts = files.map((filename) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
    const { data, content } = parseFrontmatter(raw);

    if (!data.title || !data.date) {
      throw new Error(`${filename}: frontmatter에 title과 date가 모두 필요합니다.`);
    }

    const slug = deriveSlug(filename, data);
    const contentHtml = markdownToHtml(content);
    const excerpt = data.excerpt || excerptFromHtml(contentHtml, 150);

    return { title: data.title, date: data.date, slug, excerpt, contentHtml };
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  for (const post of posts) {
    const bodyHtml = renderPostPage(post);
    const html = renderLayout({ title: post.title, description: post.excerpt, bodyHtml });
    fs.writeFileSync(path.join(DIST_DIR, 'posts', `${post.slug}.html`), html, 'utf8');
  }

  const listBodyHtml = renderListPage({ posts, apps: APPS });
  const listHtml = renderLayout({ title: 'My Blog', description: '', bodyHtml: listBodyHtml });
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), listHtml, 'utf8');

  fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true });

  for (const app of APPS) {
    copyAppAssets(app.name);
  }

  console.log(`빌드 완료: 글 ${posts.length}개, 웹앱 ${APPS.length}개 + index.html`);
}

build();
