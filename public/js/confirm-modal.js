// confirm-modal.js — replaces native confirm() with an in-theme modal.
// Usage: put data-confirm="Your message" on the <button type="submit"> that should
// prompt before its form submits (works even when the button has its own formaction,
// e.g. a "Delete" button inside a form whose default action is "Save").
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.createElement('div');
  modal.id = 'confirm-modal';
  modal.className = 'hidden fixed inset-0 bg-black/40 items-center justify-center z-50 px-4';
  modal.innerHTML = `
    <div class="pop-in bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
      <p id="confirm-modal-message" class="text-slate-700 font-medium mb-6 text-center"></p>
      <div class="flex gap-3">
        <button type="button" id="confirm-modal-cancel" class="flex-1 px-4 py-2 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 transition">Cancel</button>
        <button type="button" id="confirm-modal-ok" class="flex-1 px-4 py-2 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 transition">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const messageEl = modal.querySelector('#confirm-modal-message');
  const cancelBtn = modal.querySelector('#confirm-modal-cancel');
  const okBtn = modal.querySelector('#confirm-modal-ok');
  let pendingForm = null;
  let pendingSubmitter = null;

  function showModal(message, form, submitter) {
    messageEl.textContent = message;
    pendingForm = form;
    pendingSubmitter = submitter;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function hideModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    pendingForm = null;
    pendingSubmitter = null;
  }

  cancelBtn.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  okBtn.addEventListener('click', () => {
    if (pendingForm && pendingSubmitter) {
      pendingSubmitter.dataset.confirmed = 'true';
      pendingForm.requestSubmit(pendingSubmitter);
      delete pendingSubmitter.dataset.confirmed;
    }
    hideModal();
  });

  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      const submitter = e.submitter;
      if (submitter && submitter.dataset.confirm && submitter.dataset.confirmed !== 'true') {
        e.preventDefault();
        showModal(submitter.dataset.confirm, form, submitter);
      }
    });
  });
});
