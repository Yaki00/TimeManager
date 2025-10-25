import { Button, Input , Modal, Form, Divider, message } from "antd";
import { AntDesignOutlined } from '@ant-design/icons';
import React, { useEffect, useState, useMemo } from "react";
import { Breadcrumbs } from "../utils/Breadcrumb";
import { CreateTeamForm } from "../components/form/CreateTeamForm";
import { ButtonStyle } from "../utils/ButtonStyle";
import { useUserStore } from "../zustand/store";
import { useCreateTeam, useDeleteTeam, useGetTeams } from "../service/useTeam";
import { TeamCard } from "../components/TeamCard";
import { columnsTeam } from "../components/column/ColumnsTeam";
import { TableStyle } from "../utils/TableStyle";



export const Teams = () => {
	const preference = useUserStore((state) => state.user.preferences.filterTeams);
	const setPreferences = useUserStore((state) => state.setPreferences);
	const user = useUserStore((state) => state.user);
	
	const { data: teamsData, isLoading: loadingTeams } = useGetTeams();
	
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const { createTeamAsync, isLoading } = useCreateTeam();
	const {deleteTeamAsync, isLoading: isDeleting} = useDeleteTeam();


	const filteredTeams = useMemo(() => {
		if (!teamsData) return [];
		if (!searchTerm) return teamsData;
		return teamsData.filter(team => 
			team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [teamsData, searchTerm]);

	if (loadingTeams) return <div>Chargement des équipes...</div>;
	if (!teamsData) return <div>Aucune équipe trouvée.</div>;


	const onFinish = async (values) => {
		try {
			const newTeam = {
				ownerId: user.id,
				teamName: values.teamName,
				description: values.description,
				members: 
					values.members.map(memberId => ({
						userId: memberId,
						isLead: false,
					}))
			};
			await createTeamAsync(newTeam);
			message.success(`L'équipe "${values.teamName}" a été créée avec succès!`);
			form.resetFields(); 
			setIsModalOpen(false);
		} catch (error) {
			message.error(error);
		}
	};

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleCancel = () => {
		form.resetFields();
		setIsModalOpen(false);
	};

	const toggleView = () => {
		const newPreference = preference === "card" ? "table" : "card";
		setPreferences({ filterTeams: newPreference });
	};

	const handleSearch = (e) => {
		const value = e.target.value;
		setSearchTerm(value);
	}

	const Footer = () => {
		return (<div style={{ textAlign: 'right' }}>
			<p style={{marginRight:20}}>Total: {filteredTeams.length}</p>
		</div>);
	}

	const handleDelete = async (record) => {
		console.log("Deleting team with ID:", record);
		try {
			await deleteTeamAsync(record.id);
			message.success(`L'équipe "${record.teamName}" a été supprimée avec succès !`);
		} catch (error) {
			message.error("Échec de la suppression de l'équipe. Veuillez réessayer.");
		}
	};

	const columnsTeams = columnsTeam(handleDelete, isDeleting);

	return (
		<>
		<Breadcrumbs
			items={[
			{ label: "Dashboard", path: "/" },
			{ label: "Teams" },
			]}
		/>
		<h1>Teams</h1>
		<div style={{ marginTop: 40, }}>
			<div style={{display: 'flex', justifyContent: "space-between", padding: "10px 20px", background: "white",borderRadius: "8px"}}>
				<div>
					<Input placeholder="Search teams..." style={{width: 200}} onChange={(e) => handleSearch(e)}/>
					<Divider type="vertical" />
					<Button icon={<AntDesignOutlined />} shape="circle" onClick={toggleView}/>
				</div>
				<ButtonStyle type="primary" onClick={showModal}>Création d'une équipe</ButtonStyle>
			</div>
			<Modal
				title={<span style={{ fontWeight: 700, fontSize: 22 }}>Création d'une équipe</span>}
				destroyOnHidden={true}
				open={isModalOpen}
				onCancel={handleCancel}
				centered
				footer={null}
				width={600}
				styles={{
					body: {
						background: "#efedfa",
						borderRadius: 12,
						padding: "32px 24px"
					}
				}}
			>
				<CreateTeamForm 
					form={form}
					onFinish={onFinish}
				/>
	  		</Modal>
			{preference === "card" ? (
			<div style={{display: 'grid', gap: 20, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 20,overflow : 'scroll', height: '70vh', paddingBottom: 10}}>
				{filteredTeams.map(team => (
					<TeamCard key={team.id} team={team} handleDelete={handleDelete}/>
				))}
			</div>
		) : (
			<div style={{marginTop: 20}}>
				<TableStyle columns={columnsTeams} dataSource={filteredTeams} pagination={false} scroll={{ y: 450 }} footer={() => <Footer />} />
			</div>
		)}
		</div>
		</>
	);
}