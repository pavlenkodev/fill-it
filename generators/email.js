// generators/email.js

function generateEmail() {
  const names = ["test", "user", "qa", "demo"];
  const domains = ["gmail.com", "mail.com", "example.com"];

  const rand = Math.floor(Math.random() * 10000);
  return `${names[Math.floor(Math.random()*names.length)]}${rand}@${domains[Math.floor(Math.random()*domains.length)]}`;
}

