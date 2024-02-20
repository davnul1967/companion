import { CAlert, CButton, CCol, CRow } from '@coreui/react'
import React, { memo, useCallback, useContext, useRef } from 'react'
import { KeyReceiver, UserConfigContext } from '../util.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExport, faHome, faPencil } from '@fortawesome/free-solid-svg-icons'
import { ConfirmExportModal, ConfirmExportModalRef } from '../Components/ConfirmExportModal.js'
import { ButtonInfiniteGrid, ButtonInfiniteGridRef, PrimaryButtonGridIcon } from './ButtonInfiniteGrid.js'
import { useHasBeenRendered } from '../Hooks/useHasBeenRendered.js'
import { useResizeObserver } from 'usehooks-ts'
import { ButtonGridHeader } from './ButtonGridHeader.js'
import { ButtonGridActions, ButtonGridActionsRef } from './ButtonGridActions.js'
import type { ControlLocation } from '@companion-app/shared/Model/Common.js'
import { RootAppStoreContext } from '../Stores/RootAppStore.js'
import { EditPagePropertiesModal, EditPagePropertiesModalRef } from './EditPageProperties.js'

interface ButtonsGridPanelProps {
	pageNumber: number
	onKeyDown: (event: React.KeyboardEvent) => void
	isHot: boolean
	buttonGridClick: (location: ControlLocation, pressed: boolean) => void
	changePage: (pageNumber: number) => void
	selectedButton: ControlLocation | null
	clearSelectedButton: () => void
}

export const ButtonsGridPanel = memo(function ButtonsPage({
	pageNumber,
	onKeyDown,
	isHot,
	buttonGridClick,
	changePage,
	selectedButton,
	clearSelectedButton,
}: ButtonsGridPanelProps) {
	const { socket, pages } = useContext(RootAppStoreContext)
	const userConfig = useContext(UserConfigContext)

	const actionsRef = useRef<ButtonGridActionsRef>(null)

	const buttonClick = useCallback(
		(location: ControlLocation, isDown: boolean) => {
			if (!actionsRef.current?.buttonClick(location, isDown)) {
				buttonGridClick(location, isDown)
			}
		},
		[buttonGridClick]
	)

	const setPage = useCallback(
		(newPage: number) => {
			if (newPage >= 1 && newPage <= pages.data.length) {
				changePage(newPage)
			}
		},
		[changePage, pages]
	)

	const changePage2 = useCallback(
		(delta: number) => {
			const pageCount = pages.data.length

			let newPage = pageNumber + delta
			if (newPage < 1) newPage += pageCount
			if (newPage > pageCount) newPage -= pageCount

			if (!isNaN(newPage)) {
				changePage(newPage)
			}
		},
		[changePage, pageNumber, pages]
	)

	const pageInfo = pages.get(pageNumber)

	const gridRef = useRef<ButtonInfiniteGridRef>(null)
	const editRef = useRef<EditPagePropertiesModalRef>(null)

	const exportModalRef = useRef<ConfirmExportModalRef>(null)
	const showExportModal = useCallback(() => {
		exportModalRef.current?.show(`/int/export/page/${pageNumber}`)
	}, [pageNumber])

	const resetPosition = useCallback(() => {
		gridRef.current?.resetPosition()
	}, [gridRef])

	const configurePage = useCallback(() => {
		editRef.current?.show(Number(pageNumber), pageInfo)
	}, [pageNumber, pageInfo])

	const gridSize = userConfig?.gridSize

	const doGrow = useCallback(
		(direction, amount) => {
			if (amount <= 0 || !gridSize) return

			switch (direction) {
				case 'left':
					socket.emit('set_userconfig_key', 'gridSize', {
						...gridSize,
						minColumn: gridSize.minColumn - (amount || 2),
					})
					break
				case 'right':
					socket.emit('set_userconfig_key', 'gridSize', {
						...gridSize,
						maxColumn: gridSize.maxColumn + (amount || 2),
					})
					break
				case 'top':
					socket.emit('set_userconfig_key', 'gridSize', {
						...gridSize,
						minRow: gridSize.minRow - (amount || 2),
					})
					break
				case 'bottom':
					socket.emit('set_userconfig_key', 'gridSize', {
						...gridSize,
						maxRow: gridSize.maxRow + (amount || 2),
					})
					break
			}
		},
		[socket, gridSize]
	)

	const [hasBeenInView, isInViewRef] = useHasBeenRendered()

	const setSizeRef = useRef(null)
	const holderSize = useResizeObserver({ ref: setSizeRef })
	const useCompactButtons = (holderSize.width ?? 0) < 680 // Cutoff for what of the header row fit in the large mode

	return (
		<KeyReceiver onKeyDown={onKeyDown} tabIndex={0} className="button-grid-panel">
			<div className="button-grid-panel-header" ref={isInViewRef}>
				<ConfirmExportModal ref={exportModalRef} title="Export Page" />
				<EditPagePropertiesModal ref={editRef} />

				<h4>Buttons</h4>
				<p>
					The squares below represent each button on your Streamdeck. Click on them to set up how you want them to look,
					and what they should do when you press or click on them.
				</p>

				<CRow innerRef={setSizeRef}>
					<CCol sm={12}>
						<ButtonGridHeader pageNumber={pageNumber} changePage={changePage2} setPage={setPage}>
							<CButton color="light" onClick={showExportModal} title="Export page" className="btn-right">
								<FontAwesomeIcon icon={faFileExport} />
								&nbsp;
								{useCompactButtons ? '' : 'Export page'}
							</CButton>
							<CButton color="light" onClick={resetPosition} title="Home Position" className="btn-right">
								<FontAwesomeIcon icon={faHome} /> {useCompactButtons ? '' : 'Home Position'}
							</CButton>
							<CButton color="light" onClick={configurePage} title="Edit Page" className="btn-right">
								<FontAwesomeIcon icon={faPencil} /> {useCompactButtons ? '' : 'Edit Page'}
							</CButton>
						</ButtonGridHeader>
					</CCol>
				</CRow>
			</div>
			<div className="button-grid-panel-content">
				{hasBeenInView && gridSize && (
					<ButtonInfiniteGrid
						ref={gridRef}
						isHot={isHot}
						pageNumber={pageNumber}
						buttonClick={buttonClick}
						selectedButton={selectedButton}
						gridSize={gridSize}
						doGrow={userConfig.gridSizeInlineGrow ? doGrow : undefined}
						buttonIconFactory={PrimaryButtonGridIcon}
					/>
				)}
			</div>
			<div className="button-grid-panel-footer">
				<CRow style={{ paddingTop: '15px' }}>
					<ButtonGridActions
						ref={actionsRef}
						isHot={isHot}
						pageNumber={pageNumber}
						clearSelectedButton={clearSelectedButton}
					/>
				</CRow>

				<CAlert color="info">
					You can use the arrow keys, pageup and pagedown to navigate with the keyboard, and use common key commands
					such as copy, paste, and cut to rearrange buttons. You can also press the delete or backspace key with any
					button highlighted to delete it.
				</CAlert>
			</div>
		</KeyReceiver>
	)
})
