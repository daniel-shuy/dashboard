import '@testing-library/jest-dom/extend-expect'
import React from 'react';
import renderer from 'react-test-renderer';
import ExternalListContainer from '../ExternalListContainer';
import AppListContainer from '../AppListContainer';
import { Filter } from '../../../common';
import { render, cleanup, fireEvent, screen, queryByPlaceholderText } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

afterEach(() => cleanup());

it('applist renders without crashing matches snapshot', () => {
    const appList = renderer.create(
        <BrowserRouter>
            <AppListContainer />
        </BrowserRouter>
    ).toJSON();
    expect(appList).toMatchSnapshot();
});

it("render search correctly", ()=>{
    const { queryByPlaceholderText } = render(<BrowserRouter><AppListContainer /></BrowserRouter>)
    expect(queryByPlaceholderText("Search apps")).toBeTruthy()
})

it("should render list", () => {
    render(<BrowserRouter><AppListContainer /></BrowserRouter>);
    const loaderEl = screen.getByTestId("applist-loading")
    expect(loaderEl).toBeInTheDocument();
});

describe("input value", () => {
  it("update search while changing value", () => {
    const { queryByPlaceholderText } = render(<BrowserRouter><AppListContainer /></BrowserRouter>)
    const searchInput = queryByPlaceholderText("Search apps")
    fireEvent.change(searchInput, {
        target: {
            value: "testing"
        }
    })
    expect(searchInput["value"]).toBe("testing")
  })
})

it('render filter successfull', () => {
    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <Filter list={[{ key: 1, label: 'devtron', isSaved: false, isChecked: false }]}
            labelKey="label"
            buttonText="Environment: "
            searchable multi
            placeholder="Search Environment"
            type={"status"}
            applyFilter={mockApplyFilter}
        />
    );
    let btn = queryByTestId('apply-filter-status')
    fireEvent.click(btn)
    expect(mockApplyFilter).toHaveBeenCalled()
})


it('render app list successfull: apply filter env', () => {

    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <BrowserRouter>
            <AppListContainer />
        </BrowserRouter>
    );
    let btn = queryByTestId('apply-filter-environment')
    fireEvent.click(btn)
    // expect(mockApplyFilter).toHaveBeenCalled()
})

it('render app list successfull: apply status filter ', () => {
    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <BrowserRouter>
            <AppListContainer />
        </BrowserRouter>
    );
    let btn = queryByTestId('apply-filter-status')
    // fireEvent.click(btn)
    // expect(mockApplyFilter).toBeCalled()
})

it('render app list successfull: apply status filter ', () => {
    const mockApplyFilter = jest.fn();
    const { getByTestId } = render(<BrowserRouter><AppListContainer /></BrowserRouter>);
    // let statusEl = getByTestId('environment-filter')
    expect(mockApplyFilter).not.toHaveBeenCalled();
})
