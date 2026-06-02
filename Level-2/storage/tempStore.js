const contacts = [];

function addContact(contact) {
  contacts.push({
    ...contact,
    createdAt: new Date()
  });
}

function getContacts() {
  return contacts;
}

function clearOldContacts(hours = 24) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;

  for (let index = contacts.length - 1; index >= 0; index -= 1) {
    if (contacts[index].createdAt.getTime() < cutoff) {
      contacts.splice(index, 1);
    }
  }
}

module.exports = {
  addContact,
  clearOldContacts,
  getContacts
};
