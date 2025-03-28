<?php
// src/Controller/FilterController.php
namespace App\Controller;

use App\Entity\Filter;
use App\Entity\FilterValues;
use App\Form\CriteriaType;
use App\Form\FiltersType;
use App\Repository\FiltersRepository;
use App\Repository\FilterTypesRepository;
use App\Repository\FilterSubtypesRepository;
use App\Repository\FilterValuesRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class FilterController extends AbstractController
{
    private $filtersRepository;
    private $filterTypesRepository;
    private $filterSubtypesRepository;
    private $filterValuesRepository;

    public function __construct(
        FiltersRepository $filtersRepository,
        FilterTypesRepository $filterTypesRepository,
        FilterSubtypesRepository $filterSubtypesRepository,
        FilterValuesRepository $filterValuesRepository
    ) {
        $this->filtersRepository = $filtersRepository;
        $this->filterTypesRepository = $filterTypesRepository;
        $this->filterSubtypesRepository = $filterSubtypesRepository;
        $this->filterValuesRepository = $filterValuesRepository;
    }
    #[Route('/filter/new', name: 'new_filter')]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $filter = new Filter();
        $form = $this->createForm(FiltersType::class, $filter);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $filter = $form->getData();
            $entityManager->persist($filter);
            $entityManager->flush();

            return $this->redirectToRoute('filter_list');
        }

        return $this->render('MainBundle/form.html.twig', [
            'form' => $form->createView()
        ]);
    }

    #[Route('/filter/new/modal', name: 'new_filter_modal')]
    public function newModal(Request $request, EntityManagerInterface $entityManager): Response
    {
        $filter = new Filter();
        $form = $this->createForm(FiltersType::class, $filter);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $filter = $form->getData();
            $entityManager->persist($filter);
            $entityManager->flush();

            return $this->redirectToRoute('filter_list');
        }

        return $this->render('MainBundle/_form.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    #[Route('/filter/edit/{id}', name: 'edit_filter')]
    public function edit(Request $request, int $id, EntityManagerInterface $entityManager): Response
    {
        $filter = $this->filtersRepository->find($id);
        if (!$filter) {
            return new Response('Filter not found', 404);
        }
        $form = $this->createForm(FiltersType::class, $filter);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $filter = $form->getData();
            $entityManager->persist($filter);
            $entityManager->flush();

            return $this->redirectToRoute('filter_list');
        }
        return $this->render('MainBundle/form.html.twig', [
            'form' => $form->createView(),
            'title' => 'Edit filter'
        ]);
    }

    #[Route('/filter/edit/modal/{id}', name: 'edit_filter_modal', methods: ['GET'])]
    public function editModal(Request $request, int $id, EntityManagerInterface $entityManager): Response
    {
        $filter = $entityManager->getRepository(Filter::class)->find($id);
        if (!$filter) {
            return new Response('Filter not found', 404);
        }

        $form = $this->createForm(FiltersType::class, $filter);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $filter = $form->getData();
            dump($filter);
            $entityManager->persist($filter);
            $entityManager->flush();

            return $this->redirectToRoute('filter_list');
        }

        return $this->render('MainBundle/_form.html.twig', [
            'form' => $form->createView(),
            'title' => 'Edit Filter'
        ]);
    }

    #[Route('/filter/delete/{id}', name: 'delete_filter', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $filter = $entityManager->getRepository(Filter::class)->find($id);
        if (!$filter) {
            return new JsonResponse(['message' => 'Filter not found'], 404);
        }
        $entityManager->remove($filter);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Filter deleted successfully'], 200);
    }

    #[Route('/api/subtypes/{typeId}', name: 'get_subtypes', methods: ['GET'])]
    public function getSubtypes(int $typeId): JsonResponse
    {
        $subtypes = $this->filterSubtypesRepository->findBy(['type' => $typeId]);

        $data = [];
        foreach ($subtypes as $subtype) {
            $data[] = [
                'id' => $subtype->getId(),
                'name' => $subtype->getName(),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/api/valuetype/{typeId}', name: 'get_value_type', methods: ['GET'])]
    public function getValueType(int $typeId): JsonResponse
    {
        $valueType = $this->filterValuesRepository->findValueTypeByTypeId($typeId);

        if (!$valueType) {
            return new JsonResponse(['error' => 'No value type found'], 404);
        }

        return new JsonResponse(['valueType' => $valueType]);
    }

    #[Route('/api/filtervalues', name: 'get_filtervalues', methods: ['GET'])]
    public function getFilterValues(): JsonResponse
    {
        $filterValue = $this->filterValuesRepository->findAll();

        if (!$filterValue) {
            return new JsonResponse(['error' => 'No value types found'], 404);
        }

        $data = [];
        /* @var FilterValues $value*/
        foreach ($filterValue as $value) {
            $data[] = [
                'id' => $value->getId(),
                'type' => $value->getValueType(),
            ];
        }

        return new JsonResponse($data);
    }
}

