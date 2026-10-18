// Shared validators for the Mongoose models

const httpUrl = {
  validator: (value) => !value || /^https?:\/\/[^\s<>"']+$/i.test(value),
  message: (props) => `${props.path} must be a full web address starting with https://`,
};

function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Copies only the listed keys, so a request can never set fields such as _id or timestamps
function pick(source, keys) {
  const out = {};
  for (const key of keys) {
    if (source && source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

module.exports = { httpUrl, slugify, pick };
