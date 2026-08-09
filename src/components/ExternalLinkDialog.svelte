<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { currentLocale, getT } from "@/i18n";
  import {
    installExternalLinkGuard,
    type InterceptPayload,
  } from "@/toolkit/externalLinkGuard";

  interface Props {
    /** 站点 URL，用于识别同源链接 */
    siteUrl?: string;
  }

  const { siteUrl = "" }: Props = $props();
  const t = getT(currentLocale);

  let dialogEl = $state<HTMLDialogElement | null>(null);
  let pending = $state<InterceptPayload | null>(null);
  let resolveFn: ((value: boolean) => void) | null = null;

  function openDialog(payload: InterceptPayload): Promise<boolean> {
    pending = payload;
    if (!dialogEl) return Promise.resolve(true);

    resolveFn?.(false);

    return new Promise<boolean>((resolve) => {
      resolveFn = resolve;
      if (typeof dialogEl!.showModal === "function") {
        dialogEl!.showModal();
      }
    });
  }

  function closeWith(result: boolean): void {
    const resolver = resolveFn;
    resolveFn = null;
    pending = null;
    if (dialogEl?.open) dialogEl.close();
    resolver?.(result);
  }

  function onConfirm(): void {
    closeWith(true);
  }

  function onCancel(): void {
    closeWith(false);
  }

  function onDialogCancel(event: Event): void {
    event.preventDefault();
    closeWith(false);
  }

  function onDialogClick(event: MouseEvent): void {
    if (event.target === dialogEl) closeWith(false);
  }

  onMount(() => {
    installExternalLinkGuard({
      siteUrl,
      interceptor: openDialog,
    });
  });

  onDestroy(() => {
    resolveFn?.(false);
    resolveFn = null;
  });
</script>

<dialog
  bind:this={dialogEl}
  class="external-link-dialog"
  aria-labelledby="external-link-dialog-title"
  onclick={onDialogClick}
  oncancel={onDialogCancel}
>
  {#if pending}
    <h3 id="external-link-dialog-title" class="dialog-title">
      {t("externalLink.title")}
    </h3>
    <p class="dialog-lead">{t("externalLink.lead")}</p>
    <p class="dialog-url">{pending.url}</p>
    <p class="dialog-hint">{t("externalLink.hint")}</p>
    <div class="dialog-actions">
      <button type="button" class="btn btn-cancel" onclick={onCancel}>
        {t("externalLink.cancel")}
      </button>
      <button type="button" class="btn btn-confirm" onclick={onConfirm}>
        {t("externalLink.confirm")}
      </button>
    </div>
  {/if}
</dialog>

<style>
  .external-link-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    padding: 1.5rem 1.75rem 1.35rem;
    border: 1px solid var(--grey-3, #d0d7de);
    border-radius: 0.875rem;
    max-width: min(28rem, 92vw);
    width: 100%;
    background: var(--grey-0, #fff);
    color: var(--grey-7, #24292f);
    box-shadow: 0 1.25rem 3.5rem var(--box-bg-shadow, rgba(0, 0, 0, 0.2));
    animation: extlink-fade-in 0.2s ease;
  }

  .external-link-dialog::backdrop {
    background: rgba(15, 20, 30, 0.45);
    backdrop-filter: blur(2px);
  }

  .dialog-title {
    margin: 0 0 0.75rem;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--grey-7, #24292f);
  }

  .dialog-lead {
    margin: 0 0 0.5rem;
    font-size: 0.92rem;
    color: var(--grey-6, #57606a);
    line-height: 1.6;
  }

  .dialog-url {
    margin: 0 0 0.75rem;
    padding: 0.55rem 0.8rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--primary-color, #ff7aa2) 8%, var(--grey-1, #f6f8fa));
    color: var(--primary-color, #ff7aa2);
    font-size: 0.9rem;
    font-family: var(--pf-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    overflow-wrap: anywhere;
    line-height: 1.5;
  }

  .dialog-hint {
    margin: 0 0 1.15rem;
    font-size: 0.85rem;
    color: var(--grey-5, #8b949e);
    line-height: 1.6;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
  }

  .btn {
    appearance: none;
    border: 1px solid transparent;
    border-radius: 0.5rem;
    padding: 0.5rem 1.15rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease,
      transform 0.15s ease;
  }

  .btn:active {
    transform: translateY(1px);
  }

  .btn-cancel {
    background: transparent;
    color: var(--grey-6, #57606a);
    border-color: var(--grey-3, #d0d7de);
  }

  .btn-cancel:hover {
    background: var(--grey-1, #f6f8fa);
    color: var(--grey-7, #24292f);
  }

  .btn-confirm {
    background: var(--primary-color, #ff7aa2);
    color: #fff;
  }

  .btn-confirm:hover {
    filter: brightness(1.05);
  }

  @keyframes extlink-fade-in {
    from {
      opacity: 0;
      transform: translate(-50%, calc(-50% - 6px));
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .external-link-dialog {
      animation: none;
    }
  }

  @media (max-width: 480px) {
    .external-link-dialog {
      padding: 1.25rem 1.15rem 1.1rem;
    }

    .dialog-actions {
      justify-content: stretch;
    }

    .dialog-actions .btn {
      flex: 1;
    }
  }
</style>
