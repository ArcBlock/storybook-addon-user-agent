import React from "react";
import styled from "@emotion/styled";
import Events from "@storybook/core-events";
import { ActionBar, Form } from "@storybook/components";
import { createDefineUAGetterScript } from "../utils";
import { DEFAULT_UA, SB_IFRAME, UA_LIST } from "../../constants";

const Container = styled.div({
  padding: 15,
  overflow: "auto"
});

class UASwitcher extends React.Component {
  state = {
    currentUA: DEFAULT_UA
  };

  componentDidMount() {
    this.iframe = document.getElementById(SB_IFRAME);
  }

  forceReRender() {
    this.props.channel.emit(Events.FORCE_RE_RENDER);
  }

  changeUA = ua => {
    if (ua !== this.state.currentUA) {
      console.log("switcher.render", { state: this.state, props: this.props });
      this.setState({ currentUA: ua }, () => {
        // update iframe
        this.updateUA();
      });
    }
  };

  injectUA = () => {
    const newUA = UA_LIST[this.state.currentUA].ua;

    // generate new script
    const script = createDefineUAGetterScript(newUA);

    // append to iframe head
    this.iframe.contentDocument.head.appendChild(script);

    // memoize script
    this.script = script;
  };

  updateUA = () => {
    if (!this.iframe) {
      throw new Error("Storybook iframe could not be found.");
    }

    // reset if it exists
    if (this.script) {
      this.script.parentNode.removeChild(this.script);
    }

    this.injectUA();

    this.forceReRender();
  };

  resetUA = () => {
    this.changeUA(DEFAULT_UA);
  };

  iframe = null;

  script = null;

  render() {
    const { currentUA } = this.state;
    const { active } = this.props;

    if (!active) return null;

    console.log("switcher.render", { state: this.state, props: this.props });

    return (
      <Container>
        <Form>
          <Form.Field label="User-Agent">
            <Form.Select
              size="flex"
              value={currentUA}
              onChange={e => this.changeUA(e.target.value)}
            >
              {Object.entries(UA_LIST).map(([key, { name }]) => (
                <option value={key} key={key}>
                  {key === DEFAULT_UA ? `${name} (Default)` : name}
                </option>
              ))}
            </Form.Select>
          </Form.Field>
        </Form>
        <ActionBar
          actionItems={[
            {
              title: "Reset",
              onClick: this.resetUA.bind(this),
              disabled: currentUA === DEFAULT_UA
            }
          ]}
        />
      </Container>
    );
  }
}

export default UASwitcher;
