/**
 * 外链访问确认弹窗（简化版）：
 * 用户点击站外链接时全局拦截，弹出确认框，避免误跳转。
 *
 * 拦截范围：全站所有站外 http(s) 链接（含菜单栏、侧栏、页脚、友链、正文）。
 * 放行规则：
 *   - 站内链接（相对路径、锚点、同源绝对 URL）
 *   - 非 http(s) 协议（mailto:/tel:/javascript:/data: 等）
 *   - 中键、Ctrl/Meta/Alt/Shift 修饰键点击（视为用户明确新开）
 *   - 带 `download` 属性或 `data-no-guard` 属性的链接（显式豁免）
 */

/** 拦截器回调载荷 */
export interface InterceptPayload {
  /** 目标 URL（协议相对 URL 会补上当前协议） */
  url: string;
  /** 目标 hostname（小写） */
  hostname: string;
  /** 是否要在新标签打开（原链接 target="_blank"） */
  openInNewTab: boolean;
}

/** 拦截器返回 true 表示继续跳转，false 表示取消 */
export type Interceptor = (payload: InterceptPayload) => Promise<boolean> | boolean;

/** 从站点 URL 字符串安全提取 origin */
export function normalizeSiteOrigin(siteUrl?: string): string {
  if (!siteUrl) return "";
  try {
    return new URL(siteUrl).origin;
  } catch {
    return siteUrl.replace(/\/$/, "");
  }
}

/** 判断一个 href 是否指向外部站点 */
export function isExternalUrl(href: string, siteOrigin: string): boolean {
  if (!href) return false;
  if (href.startsWith("#") || href.startsWith("?")) return false;
  if (href.startsWith("//")) return true;
  if (href.startsWith("/")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^https?:/i.test(href)) {
    return false;
  }
  try {
    const url = new URL(href);
    if (!/^https?:$/i.test(url.protocol)) return false;
    return siteOrigin ? url.origin !== siteOrigin : true;
  } catch {
    return false;
  }
}

/** 从 href 提取 hostname，失败返回空字符串 */
export function getHostname(href: string): string {
  try {
    const base = href.startsWith("//") ? "https:" : undefined;
    const url = new URL(base ? `${base}${href}` : href);
    return url.hostname.toLowerCase();
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// 浏览器侧：委托监听与拦截器注册
// ---------------------------------------------------------------------------

interface GuardState {
  siteOrigin: string;
  interceptor: Interceptor | null;
}

const state: GuardState = {
  siteOrigin: "",
  interceptor: null,
};

let listenerBound = false;

async function handleClick(event: MouseEvent): Promise<void> {
  if (event.defaultPrevented) return;
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest("a");
  if (!anchor) return;

  if (anchor.hasAttribute("data-no-guard")) return;
  if (anchor.hasAttribute("download")) return;

  const href = anchor.getAttribute("href");
  if (!href) return;

  if (!isExternalUrl(href, state.siteOrigin)) return;

  const hostname = getHostname(href);
  if (!hostname) return;

  const interceptor = state.interceptor;
  if (!interceptor) return;

  event.preventDefault();

  const absoluteUrl = href.startsWith("//") ? `${window.location.protocol}${href}` : href;
  const confirmed = await interceptor({
    url: absoluteUrl,
    hostname,
    openInNewTab: anchor.target === "_blank",
  });

  if (!confirmed) return;

  if (anchor.target === "_blank") {
    window.open(absoluteUrl, "_blank", "noopener,noreferrer");
  } else {
    window.location.assign(absoluteUrl);
  }
}

/** 安装参数 */
export interface InstallGuardOptions {
  /** 站点 URL，用于识别同源链接 */
  siteUrl?: string;
  /** 弹窗回调 */
  interceptor: Interceptor;
}

/**
 * 安装/更新全局外链拦截。
 * 幂等：多次调用只会覆盖 interceptor 与站点配置，`document` 上的监听只挂一次。
 */
export function installExternalLinkGuard(options: InstallGuardOptions): () => void {
  if (typeof document === "undefined") {
    return () => void 0;
  }

  state.siteOrigin = normalizeSiteOrigin(options.siteUrl);
  state.interceptor = options.interceptor;

  if (!listenerBound) {
    document.addEventListener("click", handleClick, true);
    listenerBound = true;
  }

  return () => {
    if (state.interceptor === options.interceptor) {
      state.interceptor = null;
    }
  };
}
