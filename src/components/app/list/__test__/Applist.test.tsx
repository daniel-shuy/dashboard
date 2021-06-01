import '@testing-library/jest-dom/extend-expect'
import React from 'react';
import renderer from 'react-test-renderer';
import ExternalListContainer from '../ExternalListContainer';
import AppListContainer from '../AppListContainer';
import { Filter } from '../../../common';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
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

it("render search correctly", () => {
    const { queryByPlaceholderText } = render(
        <BrowserRouter>
            <AppListContainer />
        </BrowserRouter>)
    expect(queryByPlaceholderText("Search apps")).toBeTruthy()
})

it("should render list", () => {
    render(
        <BrowserRouter>
            <AppListContainer />
        </BrowserRouter>);
    const loaderEl = screen.getByTestId("applist-loading")
    expect(loaderEl).toBeInTheDocument();
});

describe("input value", () => {
    it("update search while changing value", () => {
        const { queryByPlaceholderText } = render(
            <BrowserRouter>
                <AppListContainer />
            </BrowserRouter>)
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


it('render app list successfull: apply filter in environment', () => {

    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <Filter list={[{ key: 1, label: 'devtron', isSaved: false, isChecked: false }]}
            labelKey="label"
            buttonText="Environment: "
            searchable multi
            placeholder="Search Environment"
            type={"environment"}
            applyFilter={mockApplyFilter}
        />
    );
    let btn = queryByTestId('apply-filter-environment')
    fireEvent.click(btn)
    expect(mockApplyFilter).toHaveBeenCalled()
})

it('render app list successfull: apply filter in status', () => {
    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <Filter list={[{ key: 1, label: 'devtron', isSaved: false, isChecked: false }]}
            labelKey="label"
            buttonText="Status: "
            searchable multi
            placeholder="Status: All"
            type={"status"}
            applyFilter={mockApplyFilter}
        />
    );
    let btn = queryByTestId('apply-filter-status')
    fireEvent.click(btn)
    expect(mockApplyFilter).toHaveBeenCalled()
})

it('render app list successfull: apply filter in project', () => {
    const mockApplyFilter = jest.fn();
    const { queryByTestId } = render(
        <Filter list={[{ key: 1, label: 'devtron', isSaved: false, isChecked: false }]}
            labelKey="label"
            buttonText="Project: "
            searchable multi
            placeholder="Project: All"
            type={"team"}
            applyFilter={mockApplyFilter}
        />
    );
    let btn = queryByTestId('apply-filter-team')
    fireEvent.click(btn)
    expect(mockApplyFilter).toHaveBeenCalled()
})

