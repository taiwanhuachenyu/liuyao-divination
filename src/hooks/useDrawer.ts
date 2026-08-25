import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * 抽屉式对话框的键盘与焦点料理：Esc 关闭、Tab 循环于面板之内、关闭后把焦点归还唤起者、
 * 打开期间锁住页面滚动。既以 aria-modal 自任，却听任 Tab 跑到底下的页面上，是徒有其名。
 * 返回的 ref 须挂到面板元素上。
 */
export function useDrawer(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null)
  // onClose 在调用处多是行内箭头函数，每渲染一次即是新的引用。
  // 若直接入依赖，本效果便随之反复重装，焦点每次都被抢回面板首项，输入框根本没法打字
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    // 关闭后要还回去的落点，多半是唤起抽屉的那个按钮
    const opener = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
        // 面板内尚有随状态显隐者，隐去的不该拿到焦点。此处不取 offsetParent 判断：
        // 面板本身是 position:fixed，其后代的 offsetParent 可为 null，可见者亦被误判
        .filter((el) => el.offsetWidth + el.offsetHeight > 0)

    focusables()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      // 焦点已在首末之端（或不慎落到面板之外）时，越界的那一下改投另一端，是为循环
      const edge = e.shiftKey ? first : last
      if (active === edge || !panel?.contains(active)) {
        e.preventDefault()
        const target = e.shiftKey ? last : first
        target.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      opener?.focus?.()
    }
  }, [open])

  return panelRef
}
