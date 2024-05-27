import React from 'react'
import { CButton, CInput } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUndo } from '@fortawesome/free-solid-svg-icons'
import CSwitch from '../CSwitch.js'
import type { UserConfigModel } from '@companion-app/shared/Model/UserConfigModel.js'
import { observer } from 'mobx-react-lite'

interface OscConfigProps {
	config: UserConfigModel
	setValue: (key: keyof UserConfigModel, value: any) => void
	resetValue: (key: keyof UserConfigModel) => void
}

export const OscConfig = observer(function OscConfig({ config, setValue, resetValue }: OscConfigProps) {
	return (
		<>
			<tr>
				<th colSpan={3} className="settings-category">
					OSC
				</th>
			</tr>
			<tr>
				<td>OSC Listener</td>
				<td>
					<div className="form-check form-check-inline mr-1 float-right">
						<CSwitch
							color="success"
							checked={config.osc_enabled}
							size={'lg'}
							onChange={(e) => setValue('osc_enabled', e.currentTarget.checked)}
						/>
					</div>
				</td>
				<td>
					<CButton onClick={() => resetValue('osc_enabled')} title="Reset to default">
						<FontAwesomeIcon icon={faUndo} />
					</CButton>
				</td>
			</tr>
			<tr>
				<td>
					Deprecated OSC API
					<br />
					<em>(This portion of the API will be removed in a future release)</em>
				</td>
				<td>
					<div className="form-check form-check-inline mr-1 float-right">
						<CSwitch
							color="success"
							checked={config.osc_legacy_api_enabled}
							size={'lg'}
							onChange={(e) => setValue('osc_legacy_api_enabled', e.currentTarget.checked)}
						/>
					</div>
				</td>
				<td>
					<CButton onClick={() => resetValue('osc_legacy_api_enabled')} title="Reset to default">
						<FontAwesomeIcon icon={faUndo} />
					</CButton>
				</td>
			</tr>
			{ (config.osc_enabled || config.osc_legacy_api_enabled) && (<tr>
				<td>OSC Listen Port</td>
				<td>
					<div className="form-check form-check-inline mr-1">
						<CInput
							type="number"
							value={config.osc_listen_port}
							onChange={(e) => {
								let value = Math.floor(e.currentTarget.value)
								value = Math.min(value, 65535)
								value = Math.max(value, 1024)
								setValue('osc_listen_port', value)
							}}
						/>
					</div>
				</td>
				<td>
					<CButton onClick={() => resetValue('osc_listen_port')} title="Reset to default">
						<FontAwesomeIcon icon={faUndo} />
					</CButton>
				</td>
			</tr>)}
		</>
	)
})
