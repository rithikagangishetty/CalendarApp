import * as React from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import './NavMenu.css';
/**
 * A navigation menu component for the application.
 * It includes a collapsible Navbar with a NavbarBrand and NavbarToggler.
 * The Navbar can be toggled open or closed, and it contains navigation links in NavItems.
 * The appearance of the NavMenu can be customized via CSS.
 */
export default class NavMenu extends React.PureComponent<{}, { isOpen: boolean }> {
    public state = {
        isOpen: false
    };

    public render() {
        return (
            <header>
                
            </header>
        );
    }

    private toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
}
