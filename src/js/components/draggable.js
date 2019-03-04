const HIDDEN = 'is-hidden'
const HIGHLIGHT = 'is-highlight'

const coupons = $('.js-discount-coupon')
const items = $('.js-discount-item')
const body = $('body')
const doc = $(document)

const isTouch = 'ontouchstart' in window

const events = {
	start: isTouch ? 'touchstart' : 'mousedown',
	move: isTouch ? 'touchmove' : 'mousemove',
	stop: isTouch ? 'touchend' : 'mouseup'
}

const getCoord = e => {
	const pageX = isTouch ? e.touches[0].clientX : e.clientX
	const pageY = isTouch ? e.touches[0].clientY : e.clientY
	return { pageX, pageY }
}

const addDiscount = (item, coupon) => {
	item.append(`
		<div class="sidebar-item__discount js-discount-box">
			<div class="sidebar-item__row">
				<div class="sidebar-item__col">${coupon.data('discount-label')}</div>
				<div class="sidebar-item__col text-right">($${coupon.data('discount-value')})</div>
			</div>
			<button class="sidebar-item__delete js-discount-delete">
				<span class="sidebar-item__delete-icon"></span>
			</button>
		</div>
	`)
}

const isActiveItem = (item, x, y) => {
	const offset = item.offset()
	const left = offset.left
	const top = offset.top
	const right = offset.left + item.outerWidth()
	const bottom = offset.top + item.outerHeight()
	const inZoneX = left < x && right > x
	const inZoneY = top < y && bottom > y
	return inZoneX && inZoneY
}

coupons.each((i, coupon) => {
	coupon = $(coupon)
	let clone = null
	let startX = 0
	let startY = 0
	let x = 0
	let y = 0

	const handleMove = e => {
		e = getCoord(e)
		x = e.pageX
		y = e.pageY
		clone.css({
			'position': 'fixed',
			'z-index': '9999',
			'top': `${y - startY}px`,
			'left': `${x - startX}px`,
			'width': `${coupon.outerWidth()}px`
		})
		items.each((i, item) => {
			item = $(item)
			if (isActiveItem(item, x, y)) {
				item.addClass(HIGHLIGHT)
			} else {
				item.removeClass(HIGHLIGHT)
			}
		})
	}
	const handleStop = e => {
		doc.off(events.move, handleMove)
		doc.off(events.stop, handleStop)
		items.each((i, item) => {
			item = $(item)
			if (isActiveItem(item, x, y)) {
				addDiscount(item, coupon)
				item.removeClass(HIGHLIGHT)
			} else {
				item.removeClass(HIGHLIGHT)
			}
		})
		clone.remove()
	}

	coupon.on(events.start, e => {
		if (e.type.includes('mouse') && e.button !== 0) return
		e.preventDefault()
		startX = getCoord(e).pageX - coupon.offset().left
		startY = getCoord(e).pageY - coupon.offset().top
		y = getCoord(e).pageY
		x = getCoord(e).pageX
		clone = coupon.clone()
		clone.addClass(HIGHLIGHT)
		doc.on(events.move, handleMove)
		doc.on(events.stop, handleStop)
		handleMove(e)
		body.append(clone)
	})
})

items.on('click', '.js-discount-delete', e => {
	e.preventDefault()
	$(e.currentTarget)
		.closest('.js-discount-box')
		.remove()
})
