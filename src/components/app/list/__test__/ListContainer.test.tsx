import React from 'react';
import { BrowserRouter } from 'react-router-dom';


import ListContainer from '../ListContainer';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';


it("top right corner new app button", () => {
    const { getByTestId } = render(
    <BrowserRouter>
        <ListContainer closeModal={()=>""}/>
    </BrowserRouter>);
    const addButtonEl = getByTestId("new-app-btn")
    expect(addButtonEl.textContent).toBe("ic-add.svgNew app");
})