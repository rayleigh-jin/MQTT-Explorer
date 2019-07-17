import * as React from 'react'
import { Badge, Typography } from '@material-ui/core'
import { selectTextWithCtrlA } from '../../utils/handleTextSelectWithCtrlA'
import { Theme, withStyles, emphasize } from '@material-ui/core/styles'

interface HistoryItem {
  key: string
  title: JSX.Element | string
  value: string
  selected?: boolean
}

interface Props {
  items: Array<HistoryItem>
  onClick?: (index: number, element: EventTarget) => void
  classes: any
  contentTypeIndicator?: JSX.Element
  theme: Theme
}

interface State {
  collapsed: boolean
}

class HistoryDrawer extends React.Component<Props, State> {
  private handleCtrlA = selectTextWithCtrlA({ targetSelector: 'pre' })

  constructor(props: any) {
    super(props)
    this.state = {
      collapsed: true,
    }
  }

  private toggle = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  private createSelectionHandler = (index: number) => (event: React.MouseEvent) => {
    this.props.onClick && this.props.onClick(index, event.target)
    event.preventDefault()
    event.stopPropagation()
  }

  public renderHistory() {
    const style = (element: HistoryItem) => ({
      backgroundColor: element.selected
        ? emphasize(this.props.theme.palette.background.default, 0.2)
        : emphasize(this.props.theme.palette.background.default, 0.07),
      margin: '8px',
      padding: '8px 8px 0 8px',
      cursor: this.props.onClick ? 'pointer' : 'inherit',
    })

    const messageStyle: React.CSSProperties = { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }
    const elements = this.props.items.map((element, index) => (
      <div
        key={element.key}
        style={style(element)}
        onClick={this.createSelectionHandler(index)}
        tabIndex={0}
        onKeyDown={this.handleCtrlA}
      >
        <div>
          <i>{element.title}</i>
        </div>
        <div style={messageStyle}>
          <span>
            <pre>{element.value}</pre>
          </span>
        </div>
      </div>
    ))

    const visible = this.props.items.length > 0 && this.state.collapsed

    return (
      <div className={this.props.classes.main}>
        <div style={{ backgroundColor: emphasize(this.props.theme.palette.background.default, 0.07) }}>
          <Typography component={'span'} onClick={this.toggle} style={{ cursor: 'pointer', display: 'flex' }}>
            <span style={{ flexGrow: 1 }}>
              <Badge
                classes={{ badge: this.props.classes.badge }}
                invisible={!visible}
                badgeContent={this.props.items.length}
                color="primary"
              >
                {this.state.collapsed ? '▶ History' : '▼ History'}
              </Badge>
            </span>
            <span>{this.props.contentTypeIndicator}</span>
          </Typography>
        </div>
        <div style={{ maxHeight: '230px', overflowY: 'scroll' }}>
          {this.state.collapsed ? null : this.props.children}
          {this.state.collapsed ? null : elements}
        </div>
      </div>
    )
  }

  public render() {
    return <div style={{ display: 'block', width: '100%' }}>{this.renderHistory()}</div>
  }
}

const styles = (theme: Theme) => ({
  main: {
    backgroundColor: theme.palette.background.default,
    marginTop: '16px',
  },
  badge: { right: '-25px' },
})

export default withStyles(styles, { withTheme: true })(HistoryDrawer)
